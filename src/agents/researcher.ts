import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { search as _search, readWebpage as _readWebpage } from '@/tools/tavily';
import { RESEARCHER_PROMPT } from '@/prompts/researcher';

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search',
      description: 'Search the web for a given query to find information.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query string.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'readWebpage',
      description: 'Read and extract the main content from a specific URL.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The full URL of the webpage to read.' },
        },
        required: ['url'],
      },
    },
  },
];

export async function handleResearcherRequest(instruction: string): Promise<string> {
  if (!instruction || !instruction.trim()) {
    return "Empty instruction provided.";
  }

  const systemPrompt = RESEARCHER_PROMPT.replace('{{currentTime}}', new Date().toISOString());
  let internalMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: instruction },
  ];

  let rounds = 0;
  const MAX_ROUNDS = 5;

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
        return assistantMessage.content || "Task completed.";
      }

      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type === 'function') {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          console.log(`[Researcher Specialist] Round ${rounds}: Executing ${functionName}...`);

          let toolResult;
          if (functionName === 'search') {
            toolResult = await _search(functionArgs.query);
          } else if (functionName === 'readWebpage') {
            toolResult = await _readWebpage(functionArgs.url);
          }

          internalMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }
      }
    }
    return "I reached my tool limit for this research task.";
  } catch (error) {
    console.error('Researcher Specialist Error:', error);
    return "Report: Failed to complete research task.";
  }
}
