import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { listEvents, createEvent, checkConflicts } from '@/tools/calendar';
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

/**
 * Scheduler Agent
 * Refines tool data into a plain-language report for the Main Agent.
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
        } else if (fn.name === 'createEvent') {
          result = await createEvent(args.summary, args.start, args.end, args.description);
        } else if (fn.name === 'checkConflicts') {
          result = await checkConflicts(args.start, args.end);
        }

        // Internal report call (Address the Main Agent)
        const secondResponse = await poe.chat.completions.create({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: `Instruction from Main Agent: "${instruction}"

Tool Execution Result: ${JSON.stringify(result)}

Please provide a clear report for the Main Agent summarizing what was done or found.` 
            },
          ],
        });

        return secondResponse.choices[0].message.content || "I have processed the calendar task but couldn't generate a report.";
      }
    }

    return assistantMessage.content || "No updates from the Scheduler Specialist.";

  } catch (error) {
    console.error('Scheduler Specialist Error:', error);
    return `Report: Failed to process calendar task due to an error.`;
  }
}
