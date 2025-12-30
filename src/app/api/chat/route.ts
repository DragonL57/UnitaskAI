import { chat } from '@/agents/main';
import { NextRequest } from 'next/server';
import { saveMessage } from '@/actions/sessions';
import { generateAutoTitle } from '@/actions/auto-title';

export async function POST(req: NextRequest) {
  try {
    const { message, history, sessionId } = await req.json();

    if (sessionId) {
      await saveMessage(sessionId, 'user', message);
    }

    const eventGenerator = chat(message, history);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullAssistantContent = '';

        try {
          for await (const event of eventGenerator) {
            if (event.type === 'chunk') {
              fullAssistantContent += event.text;
            }
            // Encode the event as a special JSON-prefixed line
            controller.enqueue(encoder.encode(`__EVENT__:${JSON.stringify(event)}
`));
          }

          if (sessionId && fullAssistantContent) {
            await saveMessage(sessionId, 'assistant', fullAssistantContent);
            
            // Trigger auto-titling if this was the first exchange (history empty or just 1 message)
            if (!history || history.length === 0) {
              // We don't await this to avoid blocking the stream completion, but it's okay here
              await generateAutoTitle(sessionId, message);
            }
          }
        } catch (e) {
          console.error('API Streaming error:', e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('API Chat Error:', error);
    return new Response('An error occurred during your request.', { status: 500 });
  }
}
