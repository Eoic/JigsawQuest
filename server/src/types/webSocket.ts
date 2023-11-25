// Types.
enum WebSocketStatus {
  CLOSE_NORMAL = 1000,
  SERVER_ERROR = 1011,
}

// Data types.
type CursorPosition = {
  x: number;
  y: number;
};

type WebSocketConnection = {
  id: string;
  socket: WebSocket;
  position: CursorPosition;
};

// Client messages.
type C_CursorPosition = {
  type: 'C_CURSOR_POSITION';
  payload: { position: CursorPosition };
};

// Server messages.
type S_CursorPosition = {
  type: 'S_CURSOR_POSITION';
  payload: {
    userId: string;
    position: CursorPosition;
  };
};

type S_UserConnected = {
  type: 'S_USER_CONNECTED';
  payload: { userId: string };
};

type S_UserDisconnected = {
  type: 'S_USER_DISCONNECTED';
  payload: { userId: string };
};

type S_ConnectedUsers = {
  type: 'S_CONNECTED_USERS';
  payload: {
    users: {
      userId: string;
      position: CursorPosition;
      isOwner: boolean;
    }[];
  };
};

type ServerMessage = S_CursorPosition | S_UserConnected | S_UserDisconnected | S_ConnectedUsers;
type ClientMessage = C_CursorPosition;

export type {
  C_CursorPosition,
  ClientMessage,
  S_ConnectedUsers,
  S_CursorPosition,
  S_UserConnected,
  S_UserDisconnected,
  ServerMessage,
  WebSocketConnection,
};

export { WebSocketStatus };
