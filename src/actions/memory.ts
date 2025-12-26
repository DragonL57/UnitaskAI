'use server';

import { readMemory, deleteMemory, MemoryEntry } from '@/agents/memory';
import { revalidatePath } from 'next/cache';

export async function getMemory(): Promise<MemoryEntry[]> {
  return await readMemory();
}

export async function removeMemoryEntry(key: string) {
  await deleteMemory(key);
  revalidatePath('/');
}
