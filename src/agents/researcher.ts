import OpenAI from 'openai';
import { poe, MODEL_NAME } from '@/lib/poe';
import { search as _tavilySearch, readWebpage as _readWebpage } from '@/tools/tavily';
import { search as _braveSearch } from '@/tools/brave-search';
import { readWebpageWithFallback } from '@/tools/scraper';
import { RESEARCHER_PROMPT } from '@/prompts/researcher';
import { getVietnamTime } from '@/lib/utils';

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

export interface ResearcherStep {
  type: 'search' | 'read';
  query?: string;
  url?: string;
  results?: { title: string; url: string }[];
  engine?: 'brave' | 'tavily';
  status?: 'success' | 'fallback' | 'retry' | 'error';
}

export interface ResearcherResponse {
  report: string;
  steps: ResearcherStep[];
}

/**
 * Handles a search request with resilience:
 * 1. Tries DuckDuckGo.
 * 2. If zero results, retries DDG with simplified keywords.
 * 3. If DDG fails (error), falls back to Tavily.
 * 4. If both fail, reports failure.
 */
async function resilientSearch(query: string, steps: ResearcherStep[]) {
  let toolResult;
  let currentEngine: 'brave' | 'tavily' = 'brave';
  let status: 'success' | 'fallback' | 'retry' | 'error' = 'success';

  try {
    console.log(`[Researcher] Attempting search with Brave: ${query}`);
    toolResult = await _braveSearch(query);

    if (toolResult.no_results) {
      console.log(`[Researcher] Brave returned no results. Retrying with simplified keywords...`);
      const simpleQuery = query.split(' ').filter(word => word.length > 3).join(' ') || query;
      toolResult = await _braveSearch(simpleQuery);
      status = 'retry';

      if (toolResult.no_results) {
        console.log(`[Researcher] Brave retry also failed. Falling back to Tavily...`);
        toolResult = await _tavilySearch(query);
        currentEngine = 'tavily';
        status = 'fallback';
      }
    }
  } catch (error) {
    console.error(`[Researcher] Brave Search error:`, error);
    console.log(`[Researcher] Falling back to Tavily due to error...`);
    try {
      toolResult = await _tavilySearch(query);
      currentEngine = 'tavily';
      status = 'fallback';
    } catch (tavilyError) {
      console.error(`[Researcher] Tavily also failed:`, tavilyError);
      status = 'error';
      return {
        error: "Both Brave and Tavily search tools failed.",
        results: [],
        status: 'error'
      };
    }
  }

  steps.push({
    type: 'search',
    query,
    engine: currentEngine,
    status: status,
    results: toolResult.results?.map((r: { title: string; url: string }) => ({ title: r.title, url: r.url }))
  });

  return toolResult;
}

export async function handleResearcherRequest(instruction: string): Promise<ResearcherResponse> {
  if (!instruction || !instruction.trim()) {
    return { report: "Empty instruction provided.", steps: [] };
  }

  const systemPrompt = RESEARCHER_PROMPT.replace('{{currentTime}}', getVietnamTime());
  const internalMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: instruction },
  ];

  let rounds = 0;
  const MAX_ROUNDS = 5;
  const steps: ResearcherStep[] = [];

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
        return { 
          report: assistantMessage.content || "Task completed.",
          steps
        };
      }

      // Process only first 2 tool calls to prevent API flooding
      const toolCallsToProcess = assistantMessage.tool_calls.slice(0, 2);
      
      for (const toolCall of toolCallsToProcess) {
        if (toolCall.type === 'function') {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          console.log(`[Researcher Specialist] Round ${rounds}: Executing ${functionName}...`);

          let toolResult;
          try {
            if (functionName === 'search') {
              toolResult = await resilientSearch(functionArgs.query, steps);
              
              if (toolResult.status === 'error') {
                 // Return the error to the agent context instead of crashing
                 toolResult = { error: "Search failed. Please try a different query or use internal knowledge/previous results." };
              }
            } else if (functionName === 'readWebpage') {
              try {
                toolResult = await _readWebpage(functionArgs.url);
              } catch (tavilyError: unknown) {
                const errorMessage = tavilyError instanceof Error ? tavilyError.message : String(tavilyError);
                console.warn(`[Researcher] Tavily extraction failed, trying fallback scraper...`, errorMessage);
                toolResult = await readWebpageWithFallback(functionArgs.url);
              }
              
              steps.push({
                type: 'read',
                url: functionArgs.url
              });
            }
          } catch (toolError: unknown) {
            const errorMessage = toolError instanceof Error ? toolError.message : String(toolError);
            console.error(`[Researcher] Tool ${functionName} failed:`, errorMessage);
            toolResult = { 
              error: `Tool ${functionName} failed: ${errorMessage}. Use previous information if available.` 
            };
          }

          internalMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
          });
        }
      }
    }
    return { report: "I reached my tool limit for this research task.", steps };
  } catch (error) {
    console.error('Researcher Specialist Error:', error);
    return { report: "Report: Failed to complete research task due to an internal error.", steps };
  }
}
