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

export async function handleResearcherRequest(userQuery: string) {
  try {
    // 1. First call to LLM to decide on tool usage
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: RESEARCHER_PROMPT },
        { role: 'user', content: userQuery },
      ],
      // @ts-ignore: Poe API via OpenAI SDK supports tools
      tools: tools,
      tool_choice: 'auto', 
    });

    const message = response.choices[0].message;

    // 2. Check if the LLM wants to call a tool
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

      // 3. Second call to LLM to summarize the tool result
      const secondResponse = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: RESEARCHER_PROMPT },
          { role: 'user', content: userQuery },
          message, // Assistant's intent to call tool
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          },
        ],
      });

      return secondResponse.choices[0].message.content;
    }

    // No tool called, just return the text
    return message.content;

  } catch (error) {
    console.error('Researcher Agent Error:', error);
    return "I encountered an error while trying to research that.";
  }
}