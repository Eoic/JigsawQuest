import { shallow } from 'zustand/shallow';
import { useEffect, useCallback } from 'react';
import { useWebSocketStore } from '../../store';

const Initializer = () => {
  const { setConnection } = useWebSocketStore((state) => ({ setConnection: state.setConnection }), shallow);

  const handleConnectionOpen = useCallback((event: Event) => {
    setConnection(event.target as WebSocket);
  }, [setConnection]);

  const handleConnectionClose = useCallback(() => {
    setConnection(null);
  }, [setConnection]);

  useEffect(() => {
    const webSocket = new WebSocket(import.meta.env.VITE_WEB_SOCKET_URL);
    webSocket.addEventListener('open', handleConnectionOpen);
    webSocket.addEventListener('close', handleConnectionClose);

    return () => {
      webSocket.close();
      webSocket?.removeEventListener('open', handleConnectionOpen);
      webSocket?.removeEventListener('close', handleConnectionClose);
    };
  }, [handleConnectionOpen, handleConnectionClose]);

  return null;
};

export default Initializer;
