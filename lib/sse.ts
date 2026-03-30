// Global scope for SSE clients to persist across hot reloads in Next.js development
declare global {
  var sseClients: Set<ReadableStreamDefaultController>;
}

if (!global.sseClients) {
  global.sseClients = new Set();
}

export const clients = global.sseClients;

export function notifyClients(action: string) {
  const message = `data: ${JSON.stringify({ action })}\n\n`;
  for (const client of clients) {
    try {
      client.enqueue(new TextEncoder().encode(message));
    } catch {
      clients.delete(client);
    }
  }
}
