type ClientCursorPositionMessage = {
  type: 'C_CURSOR_POSITION';
  data: { x: number; y: number; },
};

type ServerCursorPositionMessage = {
  type: 'S_CURSOR_POSITION'
  data: { x: number; y: number; },
};

export type {
  ClientCursorPositionMessage,
  ServerCursorPositionMessage,
};
