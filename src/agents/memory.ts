import { put, list } from '@vercel/blob';
import { poe, MODEL_NAME } from '@/lib/poe';
import { MEMORY_EVALUATOR_PROMPT } from '@/prompts/memory';
import { MessageContext } from '@/agents/main';

const MEMORY_FILE_NAME = 'memory.md';
const INITIAL_TEMPLATE = `# User Memory

## User Profile
- **Name:** Unknown

## Facts
- (None)
`;

export async function readMemory(): Promise<string> {
  try {
    const { blobs } = await list({ prefix: MEMORY_FILE_NAME });
    const memoryBlob = blobs.find(b => b.pathname === MEMORY_FILE_NAME);

    if (!memoryBlob) {
      console.log('[Memory Agent] Blob not found, returning initial template.');
      return INITIAL_TEMPLATE;
    }

    const response = await fetch(memoryBlob.url);
    if (!response.ok) throw new Error('Failed to fetch memory blob content');
    return await response.text();
  } catch (error) {
    console.error('[Memory Agent] Error reading memory from Blob:', error);
    return INITIAL_TEMPLATE;
  }
}

export async function saveMemory(content: string) {
  try {
    await put(MEMORY_FILE_NAME, content, {
      access: 'public',
      addRandomSuffix: false, // Ensure we can find it by name
    });
    console.log('[Memory Agent] Memory saved to Vercel Blob.');
  } catch (error) {
    console.error('[Memory Agent] Error saving memory to Blob:', error);
  }
}

export async function evaluateAndStore(userQuery: string, history: MessageContext[] = []) {
  try {
    const currentMemory = await readMemory();
    const systemPrompt = MEMORY_EVALUATOR_PROMPT.replace('{{currentMemory}}', currentMemory);
    
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User Message: "${userQuery}"` }
      ],
    });

    const output = response.choices[0].message.content || 'NO_UPDATE';

    if (output.trim() !== 'NO_UPDATE' && output.includes('# User Memory')) {
      await saveMemory(output);
    } else {
      console.log('[Memory Agent] No memory update needed.');
    }

  } catch (error) {
    console.error('[Memory Agent] Evaluation failed:', error);
  }
}