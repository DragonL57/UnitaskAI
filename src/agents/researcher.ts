import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { search as _search, readWebpage as _readWebpage } from '@/tools/tavily';
import { RESEARCHER_PROMPT } from '@/prompts/researcher';

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search',
      description: 'Search the web for a given query to find information.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query string.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'readWebpage',
      description: 'Read and extract the main content from a specific URL.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The full URL of the webpage to read.' },
        },
        required: ['url'],
      },
    },
  },
];

/**
 * Researcher Agent
 * Refines tool data into a plain-language report for the Main Agent.
 */
export async function handleResearcherRequest(instruction: string): Promise<string> {
  if (!instruction || !instruction.trim()) {
    return "Empty instruction provided.";
  }

  console.log('[Researcher Specialist] Received instruction:', instruction);

  const systemPrompt = RESEARCHER_PROMPT.replace('{{currentTime}}', new Date().toISOString());

  try {
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: instruction },
      ],
      tools: tools,
      tool_choice: 'auto', 
    });

    const assistantMessage = response.choices[0].message;

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      
      if (toolCall.type === 'function') {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`[Researcher Specialist] Executing tool: ${functionName}`);

        let toolResult;
        if (functionName === 'search') {
          toolResult = await _search(functionArgs.query);
        } else if (functionName === 'readWebpage') {
          toolResult = await _readWebpage(functionArgs.url);
        }

        // Internal report call (Address the Main Agent)
        const secondResponse = await poe.chat.completions.create({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: RESEARCHER_PROMPT },
            {
              role: 'user', 
              content: `Instruction from Main Agent: "${instruction}"\n\nSearch/Reading Results: ${JSON.stringify(toolResult)}\n\nPlease provide a clear, comprehensive report for the Main Agent summarizing the findings.` 
            },
          ],
        });

        return secondResponse.choices[0].message.content || "I have gathered data but couldn't generate a report.";
      }
    }

    return assistantMessage.content || "No findings from the Research Specialist.";

  } catch (error) {
    console.error('Researcher Specialist Error:', error);
    return "Report: Failed to complete research task due to an error.";
  }
}