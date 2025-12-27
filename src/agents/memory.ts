import { put, list } from '@vercel/blob';
import { poe, MODEL_NAME } from '@/lib/poe';
import { MEMORY_EVALUATOR_PROMPT } from '@/prompts/memory';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';

const MEMORY_FILE_NAME = 'memory.md';
const INITIAL_TEMPLATE = `# User Memory

## User Profile
- **Name:** Unknown

## Preferences
- None

## Insights & Hypotheses
- None

## Key Facts
- None`;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'rethink_memory',
      description: 'Re-evaluate and update the memory content with new insights or consolidated facts.',
      parameters: {
        type: 'object',
        properties: {
          new_content: { type: 'string', description: 'The entire updated Markdown content of the memory file.' },
        },
        required: ['new_content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'finish_rethinking',
      description: 'Call this when you have finished consolidating and re-organizing the memories.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

export async function readMemory(silent = false): Promise<string> {
  if (!silent) console.log('[Memory Agent] Reading from Blob...');
  
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const { blobs } = await list({ prefix: MEMORY_FILE_NAME });
      const memoryBlob = blobs
        .filter(b => b.pathname === MEMORY_FILE_NAME)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];

      if (!memoryBlob) {
        return INITIAL_TEMPLATE;
      }

      const cacheBuster = `?t=${Date.now()}`;
      // Use a slightly longer timeout and retry on failure
      const response = await fetch(memoryBlob.url + cacheBuster, { 
        cache: 'no-store',
        signal: AbortSignal.timeout(15000) // 15 seconds timeout
      });
      
      if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
      return await response.text();
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!silent) console.warn(`[Memory Agent] Read attempt ${attempt} failed:`, errorMessage);
      
      if (attempt >= maxRetries) {
        if (!silent) console.error('[Memory Agent] Max retries reached. Returning initial template.');
        return INITIAL_TEMPLATE;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
    }
  }
  return INITIAL_TEMPLATE;
}

export async function saveMemory(content: string) {
  try {
    // Always overwrite the same memory.md file, no deletion or listing
    const blob = await put(MEMORY_FILE_NAME, content, {
      access: 'public',
      addRandomSuffix: false,
    });
    console.log(`[Memory Agent] Consolidated memory saved: ${blob.url}`);
    try { revalidatePath('/'); } catch {}
  } catch (error) {
    console.error('[Memory Agent] Save error:', error);
  }
}

/**
 * Sleep-time Compute Loop (Letta-style)
 *
 * This function is triggered every N user messages (configurable, default 5).
 * It reads the current memory block (single markdown file), runs iterative consolidation
 * and inference using the LLM, and saves the updated memory block asynchronously.
 *
 * The main agent increments a step counter and triggers this function in the background
 * when the step count matches the configured frequency.
 *
 * To change the frequency, update `sleepTimeFrequency` in memoryAgentState.ts.
 */
export async function evaluateAndStore(userQuery: string) {
  try {
    let workingMemory = await readMemory(true);
    const systemPromptBase = MEMORY_EVALUATOR_PROMPT.replace('{{currentTime}}', new Date().toISOString());

    let rounds = 0;
    const MAX_ROUNDS = 10;
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPromptBase.replace('{{currentMemory}}', workingMemory) },
      { role: 'user', content: `LATEST INTERACTION TO ANALYZE: "${userQuery}"` }
    ];

    console.log('[Memory Agent] Starting Sleep-time Compute loop...');

    while (rounds < MAX_ROUNDS) {
      rounds++;
      const response = await poe.chat.completions.create({
        model: MODEL_NAME,
        messages: messages,
        tools: tools,
        tool_choice: 'auto',
      });

      const assistantMessage = response.choices[0].message;
      messages.push(assistantMessage);

      // Log inner monologue if present
      if (assistantMessage.content) {
        console.log(`[Memory Agent] Round ${rounds} Reasoning: ${assistantMessage.content.slice(0, 100)}...`);
      }

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        console.log(`[Memory Agent] No more tool calls. Ending loop.`);
        break;
      }

      const toolCall = assistantMessage.tool_calls[0];
      if (toolCall.type === 'function') {
        const fn = toolCall.function;
        const args = JSON.parse(fn.arguments);

        if (fn.name === 'finish_rethinking') {
          console.log(`[Memory Agent] Rethinking complete after ${rounds} rounds.`);
          await saveMemory(workingMemory);
          return;
        }

        if (fn.name === 'rethink_memory') {
          workingMemory = args.new_content;
          console.log(`[Memory Agent] Round ${rounds}: Memory updated/reorganized.`);
          
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: "Memory state updated successfully. Continue your reasoning process or finish.",
          });
          
          // Update the system prompt with the new working memory state for the next round
          messages[0] = { 
            role: 'system', 
            content: systemPromptBase.replace('{{currentMemory}}', workingMemory) 
          };
        }
      }
    }

    // Fallback save if loop ends without finish_rethinking
    await saveMemory(workingMemory);

  } catch (error) {
    console.error('[Memory Agent] Sleep-time loop failed:', error);
  }
}
