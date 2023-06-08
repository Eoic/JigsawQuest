import { create } from 'zustand';
import { ClientCursorPositionMessage } from '../types/webSocket';

interface WebSocketState {
  isConnected: boolean;
  connection: WebSocket | null;
  setConnection: (connection: WebSocket | null) => void;
  sendMessage: (message: ClientCursorPositionMessage) => void;
}

export default create<WebSocketState>()((set, get) => ({
  connection: null,
  isConnected: false,
  sendMessage: async (message: ClientCursorPositionMessage) => {
    if (!get().isConnected || !get().connection) {
      console.error('Could not send message - not connected');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    get().connection!.send(JSON.stringify(message));
  },
  setConnection: (connection: WebSocket | null) => set(() => ({ 
    connection,
    isConnected: !!connection
  }))
}));
