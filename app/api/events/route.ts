import { clients } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      
      // keep-alive pulse so the connection doesn't drop
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
        } catch {
          clients.delete(controller);
          clearInterval(interval);
        }
      }, 15000);

      // Cleanup on close when possible
      return () => {
        clearInterval(interval);
        clients.delete(controller);
      };
    },
    cancel(controller) {
      clients.delete(controller);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
