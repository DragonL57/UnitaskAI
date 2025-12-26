'use server';

import { chat as mainChat } from '@/agents/main';

export async function sendChatMessage(message: string) {
  try {
    const response = await mainChat(message);
    
    // We can parse the response here to identify which agent was used 
    // for UI status indicators if we use a more structured return format.
    // For now, we return the string.
    
    let agent: 'scheduler' | 'researcher' | 'main' = 'main';
    if (response.includes('[Scheduler Active]')) agent = 'scheduler';
    if (response.includes('[Researcher Active]')) agent = 'researcher';

    return {
      content: response.replace(/\[.*? Active\] /, ''),
      agent
    };
  } catch (error) {
    console.error('Server Action Error:', error);
    throw new Error('Failed to process message');
  }
}
