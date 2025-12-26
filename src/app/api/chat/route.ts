import { chat } from '@/agents/main';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const result = await chat(message, history, true);

    if ('stream' in result) {
      // Create a custom ReadableStream to pipe the OpenAI stream to the client
      const stream = new ReadableStream({
        async start(controller) {
          // Send agent info first as a special chunk
          controller.enqueue(new TextEncoder().encode(`__AGENT__:${result.agent}\n`));

          try {
            // @ts-ignore
            for await (const chunk of result.stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          } catch (e) {
            console.error('Streaming error:', e);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Fallback if not streamed (though we requested it)
    return Response.json(result);

  } catch (error) {
    console.error('API Chat Error:', error);
    return new Response('An error occurred during your request.', { status: 500 });
  }
}
