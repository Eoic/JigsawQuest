import { create } from 'zustand';
import { C_CursorPosition } from '../types/webSocket';

interface WebSocketState {
  isConnected: boolean;
  connection: WebSocket | null;
  setConnection: (connection: WebSocket | null) => void;
  sendMessage: (message: C_CursorPosition) => void;
}

export default create<WebSocketState>()((set, get) => ({
  connection: null,
  isConnected: false,
  sendMessage: async (message: C_CursorPosition) => {
    if (!get().isConnected || !get().connection) {
      console.error('Could not send message - not connected');
      return;
    }

    get().connection?.send(JSON.stringify(message));
  },
  setConnection: (connection: WebSocket | null) => set(() => ({ 
    connection,
    isConnected: !!connection
  })),
}));
