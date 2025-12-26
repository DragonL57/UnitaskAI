import fs from 'fs/promises';
import path from 'path';

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
