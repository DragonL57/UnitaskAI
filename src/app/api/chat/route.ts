import { chat, ChatEvent } from '@/agents/main';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const eventGenerator = chat(message, history);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const event of eventGenerator) {
            // Encode the event as a special JSON-prefixed line
            controller.enqueue(encoder.encode(`__EVENT__:${JSON.stringify(event)}
`));
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
