'use server';

import { chat as mainChat, MessageContext } from '@/agents/main';

/**
 * sendChatMessage Server Action
 * Note: The main chat flow has migrated to the /api/chat route for streaming support.
 * This action is maintained for non-streaming compatibility if needed.
 */
export async function sendChatMessage(message: string, history: MessageContext[] = []) {
  try {
    const result = await mainChat(message, history, false);
    
    // We only care about non-stream results here
    if ('content' in result) {
      return {
        content: result.content || '',
        agent: result.agent as 'scheduler' | 'researcher' | 'main'
      };
    }

    return { content: '', agent: 'main' as const };
  } catch (error) {
    console.error('Server Action Error in sendChatMessage:', error);
    if (error instanceof Error) {
        return { content: `Error: ${error.message}`, agent: 'main' as const };
    }
    return { content: 'An unexpected error occurred while processing your request.', agent: 'main' as const };
  }
}