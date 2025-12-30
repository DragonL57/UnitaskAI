import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { CONSULTER_PROMPT } from '@/prompts/consulter';

export interface ConsulterResponse {
  status: 'approve' | 'critique';
  feedback: string;
}

export async function handleConsulterRequest(
  userQuery: string,
  draftAnswer: string,
  conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<ConsulterResponse> {
  
  const systemPrompt = CONSULTER_PROMPT;

  // We need to present the context clearly to the Consulter
  const analysisContext = `
<analysis_context>
**User Query**: "${userQuery}"

**Conversation Context**: 
${JSON.stringify(conversationHistory.map(m => ({ role: m.role, content: m.content })).slice(-5))} 
// (Sending last 5 messages for brevity, adjustable)

**Main Agent Draft Answer**: 
"${draftAnswer}"
</analysis_context>
`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: analysisContext }
  ];

  try {
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
      response_format: { type: 'json_object' } // Enforce JSON output if supported, or rely on prompt
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { status: 'approve', feedback: 'No feedback generated.' };
    }

    try {
      const parsed = JSON.parse(content);
      return {
        status: parsed.status || 'approve',
        feedback: parsed.feedback || ''
      };
    } catch (parseError) {
      console.error('[Consulter] Failed to parse JSON response:', content, parseError);
      // Fallback: treat as approval if parsing fails to avoid blocking
      return { status: 'approve', feedback: 'Error parsing critique.' };
    }

  } catch (error) {
    console.error('[Consulter] Error:', error);
    return { status: 'approve', feedback: 'Consulter unavailable.' };
  }
}
