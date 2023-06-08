import { Router } from '../deps.ts';
import WebSocketManager from '../services/webSocketManager.ts';

const connectionsManager = new WebSocketManager();

const router = new Router();
const connections = new Map();

const broadcast = (message : any) => {
  for (const connection of connections.values()) {
    if (connection.readyState === 1) {
      connection.send(message);
    }
  }
};

router.get('/upgrade', (context) => {
  if (!context.isUpgradable) {
    context.throw(501);
  }

  connectionsManager.addConnection(context.upgrade());
});

export default router;
