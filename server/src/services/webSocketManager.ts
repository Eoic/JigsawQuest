import {
  ClientMessage,
  S_UserConnected,
  ServerMessage,
  WebSocketConnection,
  WebSocketStatus,
} from '../types/webSocket.ts';

class WebSocketManager {
  private connections: Map<string, WebSocketConnection>;

  constructor() {
    this.connections = new Map();
  }

  addConnection(socket: WebSocket) {
    const id = crypto.randomUUID();
    socket.onopen = (event: Event) => this.handleOpen(event, id);
    socket.onclose = (event: CloseEvent) => this.handleClose(event, id);
    socket.onerror = (event: Event) => this.handleError(event, id);
    socket.onmessage = (event: MessageEvent) => this.handleMessage(event, id);
    this.connections.set(id, { id, socket });
  }

  removeConnection(connection: WebSocketConnection) {
    this.connections.delete(connection.id);
    this.sendBroadcast({
      type: 'S_USER_DISCONNECTED',
      payload: { userId: connection.id },
    });
  }

  sendBroadcast(message: ServerMessage, excludedConnections: string[] = []) {
    const data = JSON.stringify(message);

    for (const connection of this.connections.values()) {
      if (excludedConnections.includes(connection.id)) {
        continue;
      }

      connection.socket.send(data);
    }
  }

  sendMessage(message: ServerMessage, connectionId: string) {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      console.error(`Could not send message to ${connectionId}.`);
      return;
    }

    const data = JSON.stringify(message);
    connection.socket.send(data);
  }

  handleOpen(_event: Event, connectionId: string) {
    const message: S_UserConnected = {
      type: 'S_USER_CONNECTED',
      payload: { userId: connectionId },
    };

    this.sendBroadcast(message, [connectionId]);
  }

  handleClose(_event: CloseEvent, connectionId: string) {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      console.error(`Could not sucessfully close connection for ${connectionId}.`);
      return;
    }

    connection.socket.close(WebSocketStatus.CLOSE_NORMAL);
    this.removeConnection(connection);
  }

  handleError(_event: Event, connectionId: string) {
    const connection = this.connections.get(connectionId);

    if (connection) {
      connection.socket.close(WebSocketStatus.SERVER_ERROR);
      this.removeConnection(connection);
    }
  }

  handleMessage(event: MessageEvent, connectionId: string) {
    const message: ClientMessage = JSON.parse(event.data);

    switch (message.type) {
      case 'C_CURSOR_POSITION':
        this.sendBroadcast({
          type: 'S_CURSOR_POSITION',
          payload: {
            userId: connectionId,
            position: message.payload.position,
          },
        }, [connectionId]);
        break;
      default:
        console.error('Could not recognize message type.');
        break;
    }
  }
}

export default WebSocketManager;
