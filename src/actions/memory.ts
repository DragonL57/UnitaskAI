'use server';

import { readMemory } from '@/agents/memory';

export async function getMemory(): Promise<string> {
  return await readMemory();
}