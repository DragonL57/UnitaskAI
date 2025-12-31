import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { listEvents, createEvent, checkConflicts, searchEvents, updateEvent, deleteEvent } from '@/tools/calendar';
import { SCHEDULER_PROMPT } from '@/prompts/scheduler';
import { getVietnamTime } from '@/lib/utils';

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
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

export interface SchedulerStep {
  type: 'list' | 'search' | 'create' | 'update' | 'delete' | 'check';
  details: string;
}

export interface SchedulerResponse {
  report: string;
  steps: SchedulerStep[];
}

export async function handleSchedulerRequest(instruction: string): Promise<SchedulerResponse> {
  const systemPrompt = SCHEDULER_PROMPT.replace('{{currentTime}}', getVietnamTime());
  const internalMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: instruction },
  ];

  let rounds = 0;
  const MAX_ROUNDS = 5;
  const steps: SchedulerStep[] = [];

  try {
    while (rounds < MAX_ROUNDS) {
      rounds++;
      const response = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: internalMessages,
        tools: tools,
        tool_choice: 'auto',
      });

      const assistantMessage = response.choices[0].message;
      internalMessages.push(assistantMessage);

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        // Specialist has finished and is providing the report
        return { 
          report: assistantMessage.content || "Task completed.", 
          steps 
        };
      }

      // Execute tool calls and add results to context
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type === 'function') {
          const fn = toolCall.function;
          const args = JSON.parse(fn.arguments);
          console.log(`[Scheduler Specialist] Round ${rounds}: Executing ${fn.name}...`);

          let result;
          if (fn.name === 'listEvents') {
            steps.push({ type: 'list', details: 'Listing upcoming events' });
            result = await listEvents();
          }
          else if (fn.name === 'searchEvents') {
            steps.push({ type: 'search', details: `Searching events: "${args.query}"` });
            result = await searchEvents(args.query);
          }
          else if (fn.name === 'createEvent') {
            steps.push({ type: 'create', details: `Creating event: "${args.summary}"` });
            result = await createEvent(args.summary, args.start, args.end, args.description);
          }
          else if (fn.name === 'updateEvent') {
            steps.push({ type: 'update', details: `Updating event: ${args.eventId}` });
            result = await updateEvent(args.eventId, args.summary, args.start, args.end, args.description);
          }
          else if (fn.name === 'deleteEvent') {
            steps.push({ type: 'delete', details: `Deleting event: ${args.eventId}` });
            result = await deleteEvent(args.eventId);
          }
          else if (fn.name === 'checkConflicts') {
            steps.push({ type: 'check', details: `Checking conflicts` });
            result = await checkConflicts(args.start, args.end);
          }

          internalMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }
      }
      // Loop continues to let specialist analyze results...
    }
    return { report: "I reached my tool limit for this calendar task.", steps };
  } catch (error) {
    console.error('Scheduler Specialist Error:', error);
    return { report: `Report: Error during calendar management.`, steps };
  }
}