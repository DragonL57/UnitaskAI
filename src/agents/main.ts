import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { readMemory } from '@/agents/memory';
import { handleSchedulerRequest } from '@/agents/scheduler';
import { handleResearcherRequest } from '@/agents/researcher';
import { MAIN_COMPANION_PROMPT } from '@/prompts/main';

const tools = [
  {
    type: 'function',
    function: {
      name: 'delegateToScheduler',
      description: 'Command the Scheduler Agent to perform a specific calendar task.',
      parameters: {
        type: 'object',
        properties: {
          instruction: { type: 'string', description: 'The refined instruction for the Scheduler Agent.' },
        },
        required: ['instruction'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delegateToResearcher',
      description: 'Command the Researcher Agent to find information.',
      parameters: {
        type: 'object',
        properties: {
          instruction: { type: 'string', description: 'The refined instruction for the Researcher Agent.' },
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
    ...history,
    { role: 'user', content: userQuery }
  ];

  try {
    // Initial call to check for tool usage (always non-streaming for intent detection)
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
      // @ts-expect-error
      tools: tools,
      tool_choice: 'auto',
    });

    const assistantMessage = response.choices[0].message;

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      
      if (toolCall.type === 'function') {
        const fn = toolCall.function;
        const args = JSON.parse(fn.arguments);

        let output = "";
        let agentName = "";
        if (fn.name === 'delegateToScheduler') {
          agentName = "scheduler";
          output = (await handleSchedulerRequest(args.instruction)) || "";
        } else if (fn.name === 'delegateToResearcher') {
          agentName = "researcher";
          output = (await handleResearcherRequest(args.instruction)) || "";
        }

        // Second call for summarization (can be streamed)
        const summaryMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          ...messages,
          {
            role: assistantMessage.role,
            content: assistantMessage.content || '',
            tool_calls: assistantMessage.tool_calls,
          },
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: output,
          },
        ];

        if (stream) {
          return {
            stream: await poe.chat.completions.create({
              model: MODEL_NAME,
              messages: summaryMessages,
              stream: true,
            }),
            agent: agentName
          };
        }

        const secondResponse = await poe.chat.completions.create({
          model: MODEL_NAME,
          messages: summaryMessages,
        });

        return { content: secondResponse.choices[0].message.content, agent: agentName };
      }
    }

    // Standard chat response (non-tool)
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
