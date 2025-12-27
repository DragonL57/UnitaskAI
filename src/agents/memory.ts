import { put, list, del } from '@vercel/blob';
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
  try {
    const { blobs } = await list({ prefix: MEMORY_FILE_NAME });
    const memoryBlob = blobs
      .filter(b => b.pathname === MEMORY_FILE_NAME)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];

    if (!memoryBlob) {
      return INITIAL_TEMPLATE;
    }

    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(memoryBlob.url + cacheBuster, { cache: 'no-store' });
    if (!response.ok) throw new Error('Fetch failed');
    return await response.text();
  } catch (error) {
    console.error('[Memory Agent] Read error:', error);
    return INITIAL_TEMPLATE;
  }
}

export async function saveMemory(content: string) {
  try {
    const { blobs } = await list({ prefix: MEMORY_FILE_NAME });
    const existing = blobs.filter(b => b.pathname === MEMORY_FILE_NAME);
    if (existing.length > 0) {
      await del(existing.map(b => b.url));
    }

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
 * Sleep-time Compute Loop
 * Iteratively refines user memory based on recent interaction.
 */
export async function evaluateAndStore(userQuery: string) {
  try {
    let workingMemory = await readMemory(true); // Silent read for background task
    const systemPromptBase = MEMORY_EVALUATOR_PROMPT.replace('{{currentTime}}', new Date().toISOString());

    let rounds = 0;
    const MAX_ROUNDS = 5; // Allow up to 5 rounds of rethinking
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPromptBase.replace('{{currentMemory}}', workingMemory) },
      { role: 'user', content: `Analyze this interaction: "${userQuery}"