import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { readMemory, evaluateAndStore } from '@/agents/memory';
import { incrementStepCounter, shouldRunSleepTimeAgent } from './memoryAgentState';
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
  tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
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
  // Step 1: Increment step counter for sleep-time agent
  incrementStepCounter();
  const memoryContent = await readMemory(true);
  const systemPrompt = MAIN_COMPANION_PROMPT
    .replace('{{memory}}', memoryContent || 'No memory yet.')
    .replace('{{currentTime}}', new Date().toISOString());

  const baseMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content } as OpenAI.Chat.Completions.ChatCompletionMessageParam)),
    { role: 'user', content: userQuery }
  ];

  const internalMessages = [...baseMessages];
  let currentRound = 0;
  const MAX_ROUNDS = 5;

  yield { type: 'agent', name: 'main' };

  try {
    // Step 2: If step count matches frequency, trigger sleep-time agent in background
    if (shouldRunSleepTimeAgent()) {
      // Fire and forget, do not block chat
      evaluateAndStore(userQuery).catch((e) => console.error('Sleep-time agent error:', e));
    }
    while (currentRound < MAX_ROUNDS) {
      currentRound++;
      
      const response = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: internalMessages,
        tools: tools,
        tool_choice: 'auto',
      });

      const assistantMessage = response.choices[0].message;
      
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        // Stream the final response using proper OpenAI SDK types
        const stream = await poe.chat.completions.create({
          model: MODEL_NAME,
          messages: internalMessages,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) yield { type: 'chunk', text: content };
        }
        return;
      }

      const toolCall = assistantMessage.tool_calls[0];
      if (toolCall.type === 'function') {
        const fn = toolCall.function;
        const args = JSON.parse(fn.arguments);

        if (assistantMessage.content) {
          // Announce intent to the user in the main chat bubble
          yield { type: 'chunk', text: assistantMessage.content + "\n\n" };
        }
        
        let agentName = "";
        if (fn.name === 'delegateToScheduler') {
          agentName = "scheduler";
        } else if (fn.name === 'delegateToResearcher') {
          agentName = "researcher";
        }

        yield { type: 'agent', name: agentName };
        yield { type: 'action', text: `Commanding ${agentName}: "${args.instruction}"` };

        const report = (await (fn.name === 'delegateToScheduler' 
          ? handleSchedulerRequest(args.instruction) 
          : handleResearcherRequest(args.instruction))) || "";

        yield { type: 'report', text: report };
        yield { type: 'agent', name: 'main' }; 

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
