import { poe, MODEL_NAME } from '@/lib/poe';

export async function renameAgent(firstMessage: string): Promise<string> {
  try {
    const response = await poe.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are a session titling assistant. Generate a concise, 3-5 word title for a chat session based on the user\'s first message. Do not use quotes or a period at the end. Be descriptive but brief.',
        },
        {
          role: 'user',
          content: firstMessage,
        },
      ],
      max_tokens: 20,
    });

    const title = response.choices[0]?.message?.content?.trim() || 'New Chat';
    
    // Clean up the title if the LLM added quotes
    return title.replace(/^["'](.+)["']$/, '$1').replace(/\.$/, '');
  } catch (error) {
    console.error('Rename Agent Error:', error);
    return 'New Chat';
  }
}
