import { poe, MODEL_NAME } from '@/lib/poe';
import { search as _search, readWebpage as _readWebpage } from '@/tools/tavily';
import { RESEARCHER_PROMPT } from '@/prompts/researcher';

const tools = [
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

export async function handleResearcherRequest(instruction: string) {
  if (!instruction || !instruction.trim()) {
    return "I received an empty instruction.";
  }

  console.log('[Researcher Agent] Received instruction:', instruction);

  try {
    // 1. Tool Selection Call
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

    const assistantMessage = response.choices[0].message;

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log(`[Researcher Agent] Executing tool: ${functionName}`);

      let toolResult;
      if (functionName === 'search') {
        toolResult = await _search(functionArgs.query);
      } else if (functionName === 'readWebpage') {
        toolResult = await _readWebpage(functionArgs.url);
      }

      // 2. Proper Tool Response Call
      const secondResponse = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: RESEARCHER_PROMPT },
          { role: 'user', content: instruction },
          // Assistant message must be exactly as received (or reconstructed cleanly)
          {
            role: 'assistant',
            content: assistantMessage.content || '',
            tool_calls: assistantMessage.tool_calls,
          },
          // Tool message with result
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          },
        ],
      });

      const finalContent = secondResponse.choices[0].message.content;
      console.log(`[Researcher Agent] Final response length: ${finalContent?.length || 0}`);
      
      return finalContent || "I found the information but couldn't summarize it.";
    }

    return assistantMessage.content || "I'm not sure how to research that.";

  } catch (error) {
    console.error('Researcher Agent Error:', error);
    return "I encountered an error while researching.";
  }
}
