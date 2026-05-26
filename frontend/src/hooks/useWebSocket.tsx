import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface WebSocketContextType {
  isConnected: boolean;
  messages: WebSocketMessage[];
  sendMessage: (data: any) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const token = localStorage.getItem('token');

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    if (!token) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws?token=${encodeURIComponent(token)}`;

      console.log('WebSocket 连接中...', wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket 已连接');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const message: WebSocketMessage = {
            type: data.type || 'message',
            data: data.data || data,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev.slice(-49), message]);
        } catch (e) {
          console.error('解析 WebSocket 消息错误:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket 连接关闭:', event.code, event.reason);
        setIsConnected(false);
        scheduleReconnect();
      };
    } catch (e) {
      console.error('WebSocket 连接失败:', e);
      setIsConnected(false);
      scheduleReconnect();
    }
  }, [token]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log('达到最大重连次数，停止重连');
      return;
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    const delay = RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current);
    console.log(`将在 ${Math.round(delay / 1000)} 秒后重连...`);

    reconnectTimerRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      connect();
    }, delay);
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket 未连接，无法发送消息');
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    connect();
  }, [connect]);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [connect, token]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        messages,
        sendMessage,
        reconnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

export function useWebSocketMessage<T = any>(
  type: string,
  handler: (data: T) => void
) {
  const { messages } = useWebSocket();

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.type === type) {
      handler(lastMessage.data);
    }
  }, [messages, type, handler]);
}

export function useWebSocketMessages() {
  const { messages } = useWebSocket();
  return messages;
}
