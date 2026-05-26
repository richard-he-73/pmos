import { useEffect, useCallback } from 'react';
import { websocketService, type MessageHandler } from '../utils/websocket';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { autoConnect = true } = options;

  useEffect(() => {
    if (autoConnect) {
      websocketService.connect();
    }

    return () => {
      if (autoConnect) {
        websocketService.disconnect();
      }
    };
  }, [autoConnect]);

  const subscribe = useCallback((eventType: string, handler: MessageHandler) => {
    websocketService.subscribe(eventType, handler);
  }, []);

  const unsubscribe = useCallback((eventType: string, handler: MessageHandler) => {
    websocketService.unsubscribe(eventType, handler);
  }, []);

  const send = useCallback((data: { type: string; payload: unknown }) => {
    websocketService.send(data);
  }, []);

  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const isConnected = useCallback(() => {
    return websocketService.isConnected();
  }, []);

  return {
    subscribe,
    unsubscribe,
    send,
    connect,
    disconnect,
    isConnected,
  };
};