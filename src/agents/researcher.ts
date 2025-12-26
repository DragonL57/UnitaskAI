import { poe, MODEL_NAME } from '@/lib/poe';
import { search as _search, readWebpage as _readWebpage } from '@/tools/tavily';
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
  if (!instruction || !instruction.trim()) {
    return "I received an empty instruction. Please provide a topic to research.";
  }

  console.log('[Researcher Agent] Processing instruction:', instruction);

  try {
    // 1. Tool Selection Call
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: RESEARCHER_PROMPT },
        { role: 'user', content: instruction },
      ],
      // @ts-expect-error - OpenAI SDK types for tools are strict, but Poe accepts this structure
      tools: tools,
      tool_choice: 'auto', 
    });

    const assistantMessage = response.choices[0].message;

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log(`[Researcher Agent] Executing ${functionName}...`);

      let toolResult;
      if (functionName === 'search') {
        toolResult = await _search(functionArgs.query);
      } else if (functionName === 'readWebpage') {
        toolResult = await _readWebpage(functionArgs.url);
      }

      // 2. Manual Injection Summary Call (Robust Pattern)
      const secondResponse = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: RESEARCHER_PROMPT },
          {
            role: 'user', 
            content: `Instruction: ${instruction}\n\nI have successfully executed the tool "${functionName}" and found the following information:\n\n${JSON.stringify(toolResult)}\n\nNow, please provide a clear and helpful summary for the user based on these results.` 
          },
        ],
      });

      return secondResponse.choices[0].message.content || "I found the information but couldn't summarize it.";
    }

    return assistantMessage.content || "I'm not sure how to research that.";

  } catch (error) {
    console.error('Researcher Agent Error:', error);
    return "I encountered an error while researching.";
  }
}
