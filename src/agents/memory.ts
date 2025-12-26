import { put, list, del } from '@vercel/blob';
import { poe, MODEL_NAME } from '@/lib/poe';
import { MEMORY_EVALUATOR_PROMPT } from '@/prompts/memory';
import { MessageContext } from '@/agents/main';
import { revalidatePath } from 'next/cache';

const MEMORY_FILE_NAME = 'memory.md';
const INITIAL_TEMPLATE = `# User Memory

## User Profile
- **Name:** Unknown

## Facts
- (None)`;

export async function readMemory(silent = false): Promise<string> {
  if (!silent) console.log('[Memory Agent] Attempting to read memory from Blob...');
  try {
    const { blobs } = await list({ prefix: MEMORY_FILE_NAME });
    const memoryBlob = blobs
      .filter(b => b.pathname === MEMORY_FILE_NAME)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];

    if (!memoryBlob) {
      console.log('[Memory Agent] No existing memory blob found. Initializing with template...');
      await saveMemory(INITIAL_TEMPLATE);
      return INITIAL_TEMPLATE;
    }

    if (!silent) console.log(`[Memory Agent] Found memory blob at: ${memoryBlob.url}`);
    
    // Add timestamp to bypass CDN cache
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(memoryBlob.url + cacheBuster, { cache: 'no-store' });
    
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    
    const content = await response.text();
    if (!silent) console.log(`[Memory Agent] Successfully read ${content.length} characters.`);
    return content;
  } catch (error) {
    console.error('[Memory Agent] Error reading memory from Blob:', error);
    return INITIAL_TEMPLATE;
  }
}

export async function saveMemory(content: string) {
  console.log('[Memory Agent] Attempting to save memory to Blob...');
  try {
    // Delete old blobs to ensure clean state
    const { blobs } = await list({ prefix: MEMORY_FILE_NAME });
    const existing = blobs.filter(b => b.pathname === MEMORY_FILE_NAME);
    
    if (existing.length > 0) {
      // console.log(`[Memory Agent] Deleting ${existing.length} old blob(s)...`); // Reduce noise
      await del(existing.map(b => b.url));
    }

    const blob = await put(MEMORY_FILE_NAME, content, {
      access: 'public',
      addRandomSuffix: false,
    });
    console.log(`[Memory Agent] Memory successfully saved! URL: ${blob.url}`);
    
    try {
      revalidatePath('/');
    } catch {
      // Ignored
    }
  } catch (error) {
    console.error('[Memory Agent] Error saving memory to Blob:', error);
    throw error;
  }
}

export async function evaluateAndStore(userQuery: string, _history: MessageContext[] = []) {
  try {
    const currentMemory = await readMemory(true); // Silent read for background task
    const systemPrompt = MEMORY_EVALUATOR_PROMPT.replace('{{currentMemory}}', currentMemory);
    
    console.log('[Memory Agent] Evaluating message for new facts...');
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User Message: "${userQuery}"` }
      ],
    });

    const output = response.choices[0].message.content || 'NO_UPDATE';

    if (output.trim() !== 'NO_UPDATE' && output.includes('# User Memory')) {
      console.log('[Memory Agent] Fact detected! Updating memory...');
      await saveMemory(output);
    } else {
      console.log('[Memory Agent] No update. LLM Output:', output.substring(0, 50));
    }

  } catch (error) {
    console.error('[Memory Agent] Background evaluation failed:', error);
  }
}
