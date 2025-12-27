'use server';

import { chat as mainChat, MessageContext } from '@/agents/main';

/**
 * sendChatMessage Server Action
 * Note: The main chat flow has migrated to the /api/chat route for streaming support.
 * This action is maintained for non-streaming compatibility by accumulating the generator chunks.
 */
export async function sendChatMessage(message: string, history: MessageContext[] = []) {
  try {
    const eventGenerator = mainChat(message, history);
    let fullContent = '';
    let lastAgent: 'scheduler' | 'researcher' | 'main' = 'main';

    for await (const event of eventGenerator) {
      if (event.type === 'chunk') {
        fullContent += event.text;
      } else if (event.type === 'agent') {
        lastAgent = event.name as 'scheduler' | 'researcher' | 'main';
      }
    }

    return {
      content: fullContent,
      agent: lastAgent
    };
  } catch (error) {
    console.error('Server Action Error in sendChatMessage:', error);
    if (error instanceof Error) {
        return { content: `Error: ${error.message}`, agent: 'main' as const };
    }
    return { content: 'An unexpected error occurred while processing your request.', agent: 'main' as const };
  }
}
