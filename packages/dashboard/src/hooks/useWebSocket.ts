'use client';

import { useEffect, useState, useCallback } from 'react';
import { getWebSocketClient, type WebSocketClient } from '@/lib/ws';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState<WebSocketClient | null>(null);

  useEffect(() => {
    const ws = getWebSocketClient();
    setClient(ws);

    const unsubConnect = ws.onConnect(() => {
      setIsConnected(true);
    });

    const unsubDisconnect = ws.onDisconnect(() => {
      setIsConnected(false);
    });

    ws.connect();

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  const subscribe = useCallback(
    (type: string, handler: (data: unknown) => void) => {
      if (!client) return () => {};
      return client.on(type, handler);
    },
    [client]
  );

  const send = useCallback(
    (type: string, data: unknown) => {
      client?.send(type, data);
    },
    [client]
  );

  return {
    isConnected,
    subscribe,
    send,
  };
}

