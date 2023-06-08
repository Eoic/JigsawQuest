import { create } from 'zustand';

interface WebSocketState {
  isConnected: boolean;
  connection: WebSocket | null;
  setConnection: (connection: WebSocket | null) => void;
}

export default create<WebSocketState>()((set) => ({
  connection: null,
  isConnected: false,
  setConnection: (connection: WebSocket | null) => set(() => ({ 
    connection,
    isConnected: !!connection
  }))
}));
