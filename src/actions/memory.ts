'use server';

import { readMemory } from '@/agents/memory';
import { unstable_noStore as noStore } from 'next/cache';

export async function getMemory(): Promise<string> {
  noStore(); // Opt out of static caching for this Server Action
  return await readMemory();
}
