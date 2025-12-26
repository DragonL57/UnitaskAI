'use server';

import { readMemory } from '@/agents/memory';
import { unstable_noStore as noStore } from 'next/cache';

export async function getMemory(): Promise<string> {
  noStore();
  // Pass true to silence the logs during polling
  return await readMemory(true);
}