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
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

export type ChatEvent = 
  | { type: 'agent', name: string }
  | { type: 'thought', text: string }
  | { type: 'action', text: string }
  | { type: 'report', text: string }
  | { type: 'chunk', text: string };

/**
 * Chat Orchestrator (Async Generator)
 * Yields orchestration events during the reasoning loop.
 */
export async function* chat(userQuery: string, history: MessageContext[] = []): AsyncGenerator<ChatEvent> {
  const memoryContent = await readMemory(true);
  const systemPrompt = MAIN_COMPANION_PROMPT
    .replace('{{memory}}', memoryContent || 'No memory yet.')
    .replace('{{currentTime}}', new Date().toISOString());

  const baseMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content } as OpenAI.Chat.Completions.ChatCompletionMessageParam)),
    { role: 'user', content: userQuery }
  ];

  let internalMessages = [...baseMessages];
  let currentRound = 0;
  const MAX_ROUNDS = 5;
  let lastAgentUsed = 'main';

  yield { type: 'agent', name: 'main' };

  try {
    while (currentRound < MAX_ROUNDS) {
      currentRound++;
      
      const response = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: internalMessages,
        tools: tools,
        tool_choice: 'auto',
      });

      const assistantMessage = response.choices[0].message;
      
      // 1. Final Synthesis
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        // Stream the final response
        const stream = await poe.chat.completions.create({
          model: MODEL_NAME,
          messages: internalMessages,
          stream: true,
        });

        // @ts-expect-error - OpenAI SDK stream types
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) yield { type: 'chunk', text: content };
        }
        return;
      }

      // 2. Handle Tool Calls
      const toolCall = assistantMessage.tool_calls[0];
      if (toolCall.type === 'function') {
        const fn = toolCall.function;
        const args = JSON.parse(fn.arguments);

        // Yield thought and action
        if (assistantMessage.content) {
          yield { type: 'thought', text: assistantMessage.content };
        }
        
        let agentName = "";
        let actionDesc = "";
        if (fn.name === 'delegateToScheduler') {
          agentName = "scheduler";
          actionDesc = `Requesting Scheduler: "${args.instruction}"`;
        } else if (fn.name === 'delegateToResearcher') {
          agentName = "researcher";
          actionDesc = `Requesting Researcher: "${args.instruction}"`;
        }

        yield { type: 'agent', name: agentName };
        yield { type: 'action', text: actionDesc };

        const report = (await (fn.name === 'delegateToScheduler' 
          ? handleSchedulerRequest(args.instruction) 
          : handleResearcherRequest(args.instruction))) || "";

        yield { type: 'report', text: report };
        yield { type: 'agent', name: 'main' }; // Switch back to main for next reasoning

        internalMessages.push(assistantMessage);
        internalMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: `Specialist Report from ${agentName}: "${report}"`,
        });
      } else {
        break;
      }
    }

    yield { type: 'chunk', text: "I've reached my limit for this task. Could you be more specific?" };

  } catch (error) {
    console.error('Main Agent Orchestration Error:', error);
    yield { type: 'chunk', text: "I'm sorry, I encountered an error while processing your request." };
  }
}