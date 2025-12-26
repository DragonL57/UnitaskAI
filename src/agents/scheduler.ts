import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { listEvents, createEvent, checkConflicts, searchEvents, updateEvent, deleteEvent } from '@/tools/calendar';
import { SCHEDULER_PROMPT } from '@/prompts/scheduler';

const tools = [
  {
    type: 'function',
    function: {
      name: 'listEvents',
      description: 'List the upcoming events on the user\'s calendar.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchEvents',
      description: 'Search for specific events by title or keyword.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search term (e.g., "Dentist")' },
        },
        required: ['query'],
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
      name: 'updateEvent',
      description: 'Modify an existing event.',
      parameters: {
        type: 'object',
        properties: {
          eventId: { type: 'string', description: 'The unique ID of the event to update.' },
          summary: { type: 'string', description: 'New title (optional)' },
          start: { type: 'string', description: 'New start time (optional)' },
          end: { type: 'string', description: 'New end time (optional)' },
          description: { type: 'string', description: 'New description (optional)' },
        },
        required: ['eventId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteEvent',
      description: 'Delete an event from the calendar.',
      parameters: {
        type: 'object',
        properties: {
          eventId: { type: 'string', description: 'The unique ID of the event to delete.' },
        },
        required: ['eventId'],
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

/**
 * Scheduler Agent
 * Full CRUD capabilities for Google Calendar.
 */
export async function handleSchedulerRequest(instruction: string): Promise<string> {
  const systemPrompt = SCHEDULER_PROMPT.replace('{{currentTime}}', new Date().toISOString());

  try {
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: instruction },
      ],
      // @ts-expect-error
      tools: tools,
      tool_choice: 'auto',
    });

    const assistantMessage = response.choices[0].message;

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall = assistantMessage.tool_calls[0];
      
      if (toolCall.type === 'function') {
        const fn = toolCall.function;
        const args = JSON.parse(fn.arguments);
        
        console.log(`[Scheduler Specialist] Executing tool: ${fn.name}`);

        let result;
        if (fn.name === 'listEvents') {
          result = await listEvents();
        } else if (fn.name === 'searchEvents') {
          result = await searchEvents(args.query);
        } else if (fn.name === 'createEvent') {
          result = await createEvent(args.summary, args.start, args.end, args.description);
        } else if (fn.name === 'updateEvent') {
          result = await updateEvent(args.eventId, args.summary, args.start, args.end, args.description);
        } else if (fn.name === 'deleteEvent') {
          result = await deleteEvent(args.eventId);
        } else if (fn.name === 'checkConflicts') {
          result = await checkConflicts(args.start, args.end);
        }

        const secondResponse = await poe.chat.completions.create({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user', 
              content: `Instruction from Main Agent: "${instruction}"\n\nTool Execution Result: ${JSON.stringify(result)}\n\nPlease provide a clear report for the Main Agent summarizing what was done or found.` 
            },
          ],
        });

        return secondResponse.choices[0].message.content || "Action completed, but no report generated.";
      }
    }

    return assistantMessage.content || "No actions taken by Scheduler.";

  } catch (error) {
    console.error('Scheduler Specialist Error:', error);
    return `Report: Failed to process calendar task.`;
  }
}