import { poe, MODEL_NAME } from '@/lib/poe';
import { readMemory, addOrUpdateMemory } from '@/agents/memory';
import { handleSchedulerRequest } from '@/agents/scheduler';
import { handleResearcherRequest } from '@/agents/researcher';
import { MAIN_COMPANION_PROMPT } from '@/prompts/main';

const tools = [
  {
    type: 'function',
    function: {
      name: 'delegateToScheduler',
      description: 'Delegate the request to the Scheduler Agent for calendar or scheduling tasks.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The user query related to scheduling.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delegateToResearcher',
      description: 'Delegate the request to the Researcher Agent for web search or webpage reading tasks.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The user query related to research.' },
        },
        required: ['query'],
      },
    },
  },
];

export async function chat(userQuery: string) {
  const memoryEntries = await readMemory();
  const memoryString = memoryEntries
    .map(m => `- ${m.key}: ${JSON.stringify(m.value)}`)
    .join('\n');

  const systemPrompt = MAIN_COMPANION_PROMPT
    .replace('{{memory}}', memoryString || 'No memory yet.')
    .replace('{{currentTime}}', new Date().toISOString());

  try {
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery },
      ],
      // @ts-ignore
      tools: tools,
      tool_choice: 'auto',
    });

    const message = response.choices[0].message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const fn = toolCall.function;
      const args = JSON.parse(fn.arguments);

      if (fn.name === 'delegateToScheduler') {
        const output = await handleSchedulerRequest(args.query);
        return `[Scheduler Active] ${output}`;
      } else if (fn.name === 'delegateToResearcher') {
        const output = await handleResearcherRequest(args.query);
        return `[Researcher Active] ${output}`;
      }
    }

    // Handle silent memory update logic if not delegated
    if (userQuery.toLowerCase().startsWith('remember')) {
      const parts = userQuery.split(' ');
      if (parts.length > 2) {
        const key = parts[1];
        const value = parts.slice(2).join(' ');
        await addOrUpdateMemory(key, value, 'fact');
      }
    }

    return message.content;
  } catch (error) {
    console.error('Main Agent Error:', error);
    return "I'm sorry, I'm having trouble processing your request right now.";
  }
}