import { poe, MODEL_NAME } from '@/lib/poe';
import { search, readWebpage } from '@/tools/tavily';
import { RESEARCHER_PROMPT } from '@/prompts/researcher';

// Define tools for function calling
const tools = [
  {
    type: 'function',
    function: {
      name: 'search',
      description: 'Search the web for a given query to find information.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query string.',
          },
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
          url: {
            type: 'string',
            description: 'The full URL of the webpage to read.',
          },
        },
        required: ['url'],
      },
    },
  },
];

export async function handleResearcherRequest(instruction: string) {
  try {
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: RESEARCHER_PROMPT },
        { role: 'user', content: instruction },
      ],
      // @ts-ignore
      tools: tools,
      tool_choice: 'auto', 
    });

    const message = response.choices[0].message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      let toolResult;
      
      if (functionName === 'search') {
        toolResult = await search(functionArgs.query);
      } else if (functionName === 'readWebpage') {
        toolResult = await readWebpage(functionArgs.url);
      }

      const secondResponse = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: RESEARCHER_PROMPT },
          { role: 'user', content: instruction },
          message,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          },
        ],
      });

      return secondResponse.choices[0].message.content;
    }

    return message.content;

  } catch (error) {
    console.error('Researcher Agent Error:', error);
    return "I encountered an error while trying to research that.";
  }
}
