import fs from 'fs/promises';
import path from 'path';
import { poe, MODEL_NAME } from '@/lib/poe';
import { MEMORY_EVALUATOR_PROMPT } from '@/prompts/memory';
import { MessageContext } from '@/agents/main';

const MEMORY_FILE = path.join(process.cwd(), 'src/db/memory.json');

export interface MemoryEntry {
  id: string;
  key: string;
  value: unknown;
  category: 'preference' | 'fact' | 'past_interaction' | 'other';
  updatedAt: string;
}

async function ensureMemoryFile() {
  try {
    await fs.access(MEMORY_FILE);
  } catch {
    await fs.mkdir(path.dirname(MEMORY_FILE), { recursive: true });
    await fs.writeFile(MEMORY_FILE, JSON.stringify([], null, 2));
  }
}

export async function readMemory(): Promise<MemoryEntry[]> {
  await ensureMemoryFile();
  const data = await fs.readFile(MEMORY_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function saveMemory(entries: MemoryEntry[]) {
  await ensureMemoryFile();
  await fs.writeFile(MEMORY_FILE, JSON.stringify(entries, null, 2));
}

export async function addOrUpdateMemory(key: string, value: unknown, category: MemoryEntry['category'] = 'other') {
  const memory = await readMemory();
  const index = memory.findIndex(m => m.key === key);
  
  const entry: MemoryEntry = {
    id: index >= 0 ? memory[index].id : Math.random().toString(36).substring(2, 11),
    key,
    value,
    category,
    updatedAt: new Date().toISOString()
  };

  if (index >= 0) {
    memory[index] = entry;
  } else {
    memory.push(entry);
  }

  await saveMemory(memory);
  return entry;
}

export async function deleteMemory(key: string) {
  const memory = await readMemory();
  const filtered = memory.filter(m => m.key !== key);
  await saveMemory(filtered);
}

export async function searchMemory(query: string): Promise<MemoryEntry[]> {
  const memory = await readMemory();
  const lowercaseQuery = query.toLowerCase();
  return memory.filter(m => 
    m.key.toLowerCase().includes(lowercaseQuery) || 
    JSON.stringify(m.value).toLowerCase().includes(lowercaseQuery)
  );
}

// Silent Observer Logic
const tools = [
  {
    type: 'function',
    function: {
      name: 'save_memory',
      description: 'Save a specific fact or preference about the user.',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'A short label for the memory (e.g., "User Name", "Coffee Preference").' },
          value: { type: 'string', description: 'The detail to remember.' },
          category: { type: 'string', enum: ['preference', 'fact', 'other'], description: 'The type of information.' }
        },
        required: ['key', 'value', 'category'],
      },
    },
  },
];

export async function evaluateAndStore(userQuery: string, history: MessageContext[] = []) {
  try {
    // We only need the last few messages for context
    const recentHistory = history.slice(-5);
    
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: MEMORY_EVALUATOR_PROMPT },
        ...recentHistory,
        { role: 'user', content: userQuery }
      ],
      // @ts-ignore
      tools: tools,
      tool_choice: 'auto', 
    });

    const message = response.choices[0].message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === 'save_memory') {
          const args = JSON.parse(toolCall.function.arguments);
          await addOrUpdateMemory(args.key, args.value, args.category);
          console.log(`[Memory Agent] Saved: ${args.key} = ${args.value}`);
        }
      }
    }
  } catch (error) {
    console.error('[Memory Agent] Evaluation failed:', error);
  }
}