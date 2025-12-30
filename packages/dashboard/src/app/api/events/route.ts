import { NextRequest } from 'next/server';
import { getSubscriber, CHANNELS } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const subscriber = getSubscriber();
      
      const sendEvent = (event: string, data: unknown) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send heartbeat
      const heartbeat = setInterval(() => {
        sendEvent('heartbeat', { timestamp: Date.now() });
      }, 30000);

      // Subscribe to channels
      const channels = Object.values(CHANNELS);
      
      try {
        await subscriber.subscribe(...channels);
        
        subscriber.on('message', (channel, message) => {
          try {
            const data = JSON.parse(message);
            const eventName = channel.split(':').pop() || 'message';
            sendEvent(eventName, data);
          } catch {
            sendEvent('message', { raw: message });
          }
        });

        // Send initial connection event
        sendEvent('connected', { channels });

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          subscriber.unsubscribe(...channels);
        });
      } catch (error) {
        console.error('Redis subscription error:', error);
        sendEvent('error', { message: 'Failed to connect to Redis' });
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

