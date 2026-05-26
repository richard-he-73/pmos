import { message } from 'antd';

type MessageHandler = (data: WebSocketMessage) => void;

interface WebSocketMessage {
  type: string;
  payload: unknown;
}

interface Subscription {
  eventType: string;
  handler: MessageHandler;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectDelay: number;
  private subscriptions: Subscription[] = [];
  private connectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isConnecting: boolean = false;

  constructor(url: string = '/ws') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}${url}`;
    this.reconnectDelay = 1000;
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.connectAttempts = 0;
      this.isConnecting = false;
      message.success('实时连接已建立');
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const messageData: WebSocketMessage = JSON.parse(event.data);
        this.dispatchMessage(messageData);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.isConnecting = false;
      
      if (event.code !== 1000 && this.connectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    this.connectAttempts++;
    const delay = this.reconnectDelay * Math.min(this.connectAttempts, 5);
    console.log(`Reconnecting in ${delay}ms...`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Client requested disconnect');
      this.socket = null;
      this.connectAttempts = 0;
    }
  }

  subscribe(eventType: string, handler: MessageHandler): void {
    const existing = this.subscriptions.find(
      (sub) => sub.eventType === eventType && sub.handler === handler
    );
    
    if (!existing) {
      this.subscriptions.push({ eventType, handler });
    }
  }

  unsubscribe(eventType: string, handler: MessageHandler): void {
    this.subscriptions = this.subscriptions.filter(
      (sub) => !(sub.eventType === eventType && sub.handler === handler)
    );
  }

  private dispatchMessage(messageData: WebSocketMessage): void {
    const handlers = this.subscriptions.filter((sub) => sub.eventType === messageData.type);
    handlers.forEach((handler) => handler.handler(messageData));
  }

  send(data: WebSocketMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getState(): number | null {
    return this.socket?.readyState ?? null;
  }
}

const websocketService = new WebSocketService();

export { WebSocketService, websocketService };
export type { WebSocketMessage, MessageHandler };