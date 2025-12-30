'use server';

import { renameAgent } from '@/agents/rename';
import { updateSessionTitle, getSession } from './sessions';

export async function generateAutoTitle(sessionId: string, firstMessage: string) {
  try {
    const session = await getSession(sessionId);
    // Only auto-title if it's the default title
    if (!session || session.title !== 'New Chat') return;

    const cleanTitle = await renameAgent(firstMessage);

    await updateSessionTitle(sessionId, cleanTitle);
    return cleanTitle;
  } catch (error) {
    console.error('Error generating auto-title:', error);
  }
}
