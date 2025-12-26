import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { readMemory } from '@/agents/memory';
import { handleSchedulerRequest } from '@/agents/scheduler';
import { handleResearcherRequest } from '@/agents/researcher';
import { MAIN_COMPANION_PROMPT } from '@/prompts/main';

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'delegateToScheduler',
      description: 'Command the Scheduler Specialist to perform a specific calendar task.',
      parameters: {
        type: 'object',
        properties: {
          instruction: { type: 'string', description: 'The refined command for the Scheduler Specialist.' },
        },
        required: ['instruction'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delegateToResearcher',
      description: 'Command the Research Specialist to find information.',
      parameters: {
        type: 'object',
        properties: {
          instruction: { type: 'string', description: 'The refined command for the Research Specialist.' },
        },
        required: ['instruction'],
      },
    },
  },
];

export interface MessageContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chat(userQuery: string, history: MessageContext[] = [], stream = false) {
  const memoryContent = await readMemory(true);

  const systemPrompt = MAIN_COMPANION_PROMPT
    .replace('{{memory}}', memoryContent || 'No memory yet.')
    .replace('{{currentTime}}', new Date().toISOString());

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content } as OpenAI.Chat.Completions.ChatCompletionMessageParam)),
    { role: 'user', content: userQuery }
  ];

  try {
    // 1. Initial Orchestration Call
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
      tools: tools,
      tool_choice: 'auto',
    });

    const assistantMessage = response.choices[0].message;

    // 2. Check for Delegation
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      
      if (toolCall.type === 'function') {
        const fn = toolCall.function;
        const args = JSON.parse(fn.arguments);

        let report = "";
        let agentName = "";
        if (fn.name === 'delegateToScheduler') {
          agentName = "scheduler";
          report = (await handleSchedulerRequest(args.instruction)) || "";
        } else if (fn.name === 'delegateToResearcher') {
          agentName = "researcher";
          report = (await handleResearcherRequest(args.instruction)) || "";
        }

        // 3. Final Synthesis (Address the User with the Report info)
        const finalMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          ...messages,
          {
            role: assistantMessage.role,
            content: assistantMessage.content || '',
            tool_calls: assistantMessage.tool_calls,
          },
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: `Specialist Report: "${report}"`,
          },
        ];

        if (stream) {
          return {
            stream: await poe.chat.completions.create({
              model: MODEL_NAME,
              messages: finalMessages,
              stream: true,
            }),
            agent: agentName
          };
        }

        const secondResponse = await poe.chat.completions.create({
          model: MODEL_NAME,
          messages: finalMessages,
        });

        return { content: secondResponse.choices[0].message.content, agent: agentName };
      }
    }

    // Standard conversational response
    if (stream) {
      return {
        stream: await poe.chat.completions.create({
          model: MODEL_NAME,
          messages: messages,
          stream: true,
        }),
        agent: 'main'
      };
    }

    return { content: assistantMessage.content, agent: 'main' };

  } catch (error) {
    console.error('Main Agent Error:', error);
    throw error;
  }
}
