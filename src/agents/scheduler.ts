import { poe, MODEL_NAME } from '@/lib/poe';
import { listEvents, createEvent, checkConflicts } from '@/tools/calendar';
import { SCHEDULER_PROMPT } from '@/prompts/scheduler';

const tools = [
  {
    type: 'function',
    function: {
      name: 'listEvents',
      description: 'List the upcoming events on the user\'s calendar.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createEvent',
      description: 'Create a new event on the user\'s calendar.',
      parameters: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Title of the event' },
          start: { type: 'string', description: 'ISO 8601 start date-time string' },
          end: { type: 'string', description: 'ISO 8601 end date-time string' },
          description: { type: 'string', description: 'Optional description' },
        },
        required: ['summary', 'start', 'end'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'checkConflicts',
      description: 'Check if a specific time range has any conflicting events.',
      parameters: {
        type: 'object',
        properties: {
          start: { type: 'string', description: 'ISO 8601 start date-time string' },
          end: { type: 'string', description: 'ISO 8601 end date-time string' },
        },
        required: ['start', 'end'],
      },
    },
  },
];

export async function handleSchedulerRequest(instruction: string) {
  const systemPrompt = SCHEDULER_PROMPT.replace('{{currentTime}}', new Date().toISOString());

  try {
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: instruction },
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
      let result;

      console.log(`[Scheduler Agent] Calling tool: ${fn.name}`);

      if (fn.name === 'listEvents') {
        result = await listEvents();
      } else if (fn.name === 'createEvent') {
        result = await createEvent(args.summary, args.start, args.end, args.description);
      } else if (fn.name === 'checkConflicts') {
        result = await checkConflicts(args.start, args.end);
      }

      // Manual Injection Summary Call
      const secondResponse = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Instruction: ${instruction}\n\nI have accessed the user's calendar and retrieved the following raw data:\n\n${JSON.stringify(result)}\n\nNow, please provide a clear and helpful response to the user based on this data.`,
          },
        ],
      });

      return secondResponse.choices[0].message.content;
    }

    return message.content;

  } catch (error) {
    console.error('Scheduler Agent Error:', error);
    return "I encountered an error while accessing your calendar.";
  }
}
