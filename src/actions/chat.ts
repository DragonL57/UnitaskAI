'use server';

import { chat as mainChat, MessageContext } from '@/agents/main';

export async function sendChatMessage(message: string, history: MessageContext[] = []) {
  try {
    const response = await mainChat(message, history);
    
    let agent: 'scheduler' | 'researcher' | 'main' = 'main';
    let content = response || '';

    if (content.includes('[Scheduler Active]')) {
      agent = 'scheduler';
      content = content.replace('[Scheduler Active] ', '');
    }
    if (content.includes('[Researcher Active]')) {
      agent = 'researcher';
      content = content.replace('[Researcher Active] ', '');
    }

    return {
      content: content,
      agent
    };
  } catch (error) {
    console.error('Server Action Error in sendChatMessage:', error);
    if (error instanceof Error) {
        return { content: `Error: ${error.message}`, agent: 'main' as const };
    }
    return { content: 'An unexpected error occurred while processing your request.', agent: 'main' as const };
  }
}