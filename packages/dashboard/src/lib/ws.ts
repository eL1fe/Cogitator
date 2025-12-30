type MessageHandler = (data: unknown) => void;
type ConnectionHandler = () => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private onConnectHandlers: Set<ConnectionHandler> = new Set();
  private onDisconnectHandlers: Set<ConnectionHandler> = new Set();

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onConnectHandlers.forEach((handler) => handler());
      };

      this.ws.onclose = () => {
        this.onDisconnectHandlers.forEach((handler) => handler());
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as { type: string; data: unknown };
          const handlers = this.messageHandlers.get(message.type);
          handlers?.forEach((handler) => handler(message.data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.ws?.close();
    this.ws = null;
  }

  send(type: string, data: unknown): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.ws.send(JSON.stringify({ type, data }));
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.onConnectHandlers.add(handler);
    return () => {
      this.onConnectHandlers.delete(handler);
    };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.onDisconnectHandlers.add(handler);
    return () => {
      this.onDisconnectHandlers.delete(handler);
    };
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect();
    }, delay);
  }
}

let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
    wsClient = new WebSocketClient(`${protocol}//${host}/api/ws`);
  }
  return wsClient;
}

