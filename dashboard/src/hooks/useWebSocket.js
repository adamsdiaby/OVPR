import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const useWebSocket = (path = '/notifications') => {
  const ws = useRef(null);
  const { token } = useAuth();
  const eventHandlers = useRef(new Map());

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${path}`;

    ws.current = new WebSocket(wsUrl, [token]);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const handlers = eventHandlers.current.get(data.type);
      if (handlers) {
        handlers.forEach(handler => handler(data.data));
      }
    };

    ws.current.onclose = () => {
      // Reconnexion après 3 secondes
      setTimeout(connect, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.current.close();
    };
  }, [token, path]);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [token, connect]);

  const on = useCallback((event, handler) => {
    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, new Set());
    }
    eventHandlers.current.get(event).add(handler);
  }, []);

  const off = useCallback((event, handler) => {
    const handlers = eventHandlers.current.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        eventHandlers.current.delete(event);
      }
    }
  }, []);

  const send = useCallback((data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return {
    on,
    off,
    send,
    isConnected: ws.current?.readyState === WebSocket.OPEN
  };
};

export default useWebSocket;
