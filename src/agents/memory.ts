import fs from 'fs/promises';
import path from 'path';
import { poe, MODEL_NAME } from '@/lib/poe';
import { MEMORY_EVALUATOR_PROMPT } from '@/prompts/memory';
import { MessageContext } from '@/agents/main';

const MEMORY_FILE = path.join(process.cwd(), 'src/db/memory.md');

async function ensureMemoryFile() {
  try {
    await fs.access(MEMORY_FILE);
  } catch {
    await fs.mkdir(path.dirname(MEMORY_FILE), { recursive: true });
    // Default template if missing
    const template = `# User Memory

## User Profile
- **Name:** Unknown

## Facts
- (None)`;
    await fs.writeFile(MEMORY_FILE, template);
  }
}

export async function readMemory(): Promise<string> {
  await ensureMemoryFile();
  return await fs.readFile(MEMORY_FILE, 'utf-8');
}

export async function saveMemory(content: string) {
  await ensureMemoryFile();
  await fs.writeFile(MEMORY_FILE, content);
}

export async function evaluateAndStore(userQuery: string, history: MessageContext[] = []) {
  try {
    const currentMemory = await readMemory();
    
    // Inject current memory into the prompt
    const systemPrompt = MEMORY_EVALUATOR_PROMPT.replace('{{currentMemory}}', currentMemory);
    
    // We pass the user query (and maybe recent context) to the LLM
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User Message: "${userQuery}"` }
      ],
    });

    const output = response.choices[0].message.content || 'NO_UPDATE';

    if (output.trim() !== 'NO_UPDATE' && output.includes('# User Memory')) {
      console.log('[Memory Agent] Updating memory file...');
      await saveMemory(output);
    } else {
      console.log('[Memory Agent] No memory update needed.');
    }

  } catch (error) {
    console.error('[Memory Agent] Evaluation failed:', error);
  }
}
