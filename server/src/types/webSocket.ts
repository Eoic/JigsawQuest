// Types.
enum WebSocketStatus {
  CLOSE_NORMAL = 1000,
  SERVER_ERROR = 1011,
}

// Data types.
type WebSocketConnection = {
  id: string;
  socket: WebSocket;
};

// Client messages.
type C_CursorPosition = {
  type: 'C_CURSOR_POSITION';
  payload: {
    position: {
      x: number;
      y: number;
    };
  };
};

// Server messages.
type S_CursorPosition = {
  type: 'S_CURSOR_POSITION';
  payload: {
    userId: string;
    position: {
      x: number;
      y: number;
    };
  };
};

type S_UserConnected = {
  type: 'S_USER_CONNECTED';
  payload: {
    userId: string;
  };
};

type S_UserDisconnected = {
  type: 'S_USER_DISCONNECTED';
  payload: {
    userId: string;
  };
};

type ServerMessage = S_CursorPosition | S_UserConnected | S_UserDisconnected;
type ClientMessage = C_CursorPosition;

export type {
  C_CursorPosition,
  ClientMessage,
  S_CursorPosition,
  S_UserConnected,
  S_UserDisconnected,
  ServerMessage,
  WebSocketConnection,
};

export { WebSocketStatus };
