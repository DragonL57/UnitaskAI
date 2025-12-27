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

export async function chat(userQuery: string, history: MessageContext[] = [], stream = false) {
  const memoryContent = await readMemory(true);
  const systemPrompt = MAIN_COMPANION_PROMPT
    .replace('{{memory}}', memoryContent || 'No memory yet.')
    .replace('{{currentTime}}', new Date().toISOString());

  // Base messages for the entire session
  const baseMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content } as OpenAI.Chat.Completions.ChatCompletionMessageParam)),
    { role: 'user', content: userQuery }
  ];

  let internalMessages = [...baseMessages];
  let currentRound = 0;
  const MAX_ROUNDS = 5;
  let lastAgentUsed = 'main';

  try {
    while (currentRound < MAX_ROUNDS) {
      currentRound++;
      console.log(`[Main Agent] Orchestration Round ${currentRound}...`);

      const response = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: internalMessages,
        tools: tools,
        tool_choice: 'auto',
      });

      const assistantMessage = response.choices[0].message;
      
      // 1. If NO tool calls, this is the FINAL response
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        if (stream) {
          // Stream the final thought
          return {
            stream: await poe.chat.completions.create({
              model: MODEL_NAME,
              messages: internalMessages,
              stream: true,
            }),
            agent: lastAgentUsed as any
          };
        }
        return { content: assistantMessage.content, agent: lastAgentUsed as any };
      }

      // 2. Handle Tool Calls
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

        lastAgentUsed = agentName;

        // Push the assistant's request and the specialist's report to context
        internalMessages.push(assistantMessage);
        internalMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: `Specialist Report from ${agentName}: "${report}"`,
        });
        
        // Loop continues...
      } else {
        break;
      }
    }

    return { content: "I've reached my limit for this task. Could you be more specific?", agent: 'main' as const };

  } catch (error) {
    console.error('Main Agent Orchestration Error:', error);
    throw error;
  }
}
