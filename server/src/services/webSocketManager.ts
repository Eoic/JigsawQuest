import {
  ClientMessage,
  S_ConnectedUsers,
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

  /**
   * Adds a new connection to a map.
   * @param socket WebSocket connection.
   */
  addConnection(socket: WebSocket) {
    const id = crypto.randomUUID();
    socket.onopen = (event: Event) => this.handleOpen(event, id);
    socket.onclose = (event: CloseEvent) => this.handleClose(event, id);
    socket.onerror = (event: Event) => this.handleError(event, id);
    socket.onmessage = (event: MessageEvent) => this.handleMessage(event, id);
    this.connections.set(id, { id, socket, position: { x: 0, y: 0 } });
  }

  /**
   * Removes connection from the map and broadcasts
   * 'S_USER_DISCONNECTED' event to all currently connected users.
   * @param connection WebSocket connection wrapper object.
   */
  removeConnection(connection: WebSocketConnection) {
    this.connections.delete(connection.id);
    this.sendBroadcast({
      type: 'S_USER_DISCONNECTED',
      payload: { userId: connection.id },
    });
  }

  /**
   * Send a given message to all connected users, except for connections listed
   * in `exludedConnections` list, if any are provided.
   * @param message Message to be sent.
   * @param excludedConnections List of connection ids of connections which should not receive the boroadcast.
   */
  sendBroadcast(message: ServerMessage, excludedConnections: string[] = []) {
    const data = JSON.stringify(message);

    for (const connection of this.connections.values()) {
      if (excludedConnections.includes(connection.id)) {
        continue;
      }

      if (connection.socket.readyState !== 1) {
        console.error(`Socket is not ready for connection ${connection.id}.`);
        continue;
      }

      connection.socket.send(data);
    }
  }

  /**
   * Sends message to a connection, identified by connection id.
   * @param message Message to be sent.
   * @param connectionId Identifier associated with the connection.
   */
  sendMessage(message: ServerMessage, connectionId: string) {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      console.error(`Could not send message to ${connectionId}.`);
      return;
    }

    if (connection.socket.readyState !== 1) {
      console.error(`Socket is not ready for connection ${connectionId}.`);
      return;
    }

    const data = JSON.stringify(message);
    connection.socket.send(data);
  }

  /**
   * Handler for 'open' event for socket object.
   * @param _event 'open' event data.
   * @param connectionId Identifier associated with the connection.
   */
  handleOpen(_event: Event, connectionId: string) {
    const userConnectedMessage: S_UserConnected = {
      type: 'S_USER_CONNECTED',
      payload: { userId: connectionId },
    };

    const connectedUsersMessage: S_ConnectedUsers = {
      type: 'S_CONNECTED_USERS',
      payload: {
        users: [...this.connections.values()].map((connection) => ({
          userId: connection.id,
          position: connection.position,
          isOwner: connection.id === connectionId,
        })),
      },
    };

    this.sendBroadcast(userConnectedMessage, [connectionId]);
    this.sendMessage(connectedUsersMessage, connectionId);
  }

  /**
   * Handler for 'close' event for socket object.
   * @param _event 'close' event data.
   * @param connectionId Identifier associated with the connection.
   */
  handleClose(_event: CloseEvent, connectionId: string) {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      console.error(`Could not sucessfully close connection for ${connectionId}.`);
      return;
    }

    connection.socket.close(WebSocketStatus.CLOSE_NORMAL);
    this.removeConnection(connection);
  }

  /**
   * Handler for 'error' event for socket object.
   * @param _event 'error' event data.
   * @param connectionId Identifier associated with the connection.
   */
  handleError(_event: Event, connectionId: string) {
    const connection = this.connections.get(connectionId);

    if (connection) {
      connection.socket.close(WebSocketStatus.SERVER_ERROR);
      this.removeConnection(connection);
    }
  }

  /**
   * Handler for 'message' event for socket object.
   * @param _event 'message' event data.
   * @param connectionId Identifier associated with the connection.
   */
  handleMessage(event: MessageEvent, connectionId: string) {
    const message: ClientMessage = JSON.parse(event.data);
    const connection = this.connections.get(connectionId);

    if (!connection) {
      console.log(`Could not find connection ${connectionId}.`);
      return;
    }

    switch (message.type) {
      case 'C_CURSOR_POSITION':
        connection.position = message.payload.position;
        this.connections.set(connectionId, connection);

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
