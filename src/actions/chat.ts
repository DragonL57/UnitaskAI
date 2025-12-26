'use server';

import { chat as mainChat, MessageContext } from '@/agents/main';
import { evaluateAndStore } from '@/agents/memory';

export async function sendChatMessage(message: string, history: MessageContext[] = []) {
  try {
    // Fire-and-forget memory evaluation
    // We don't await this because we don't want to block the user response
    evaluateAndStore(message).catch(err => 
      console.error('Background memory evaluation error:', err)
    );

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
