import { Router } from '../deps.ts';
import WebSocketManager from '../services/webSocketManager.ts';

const router = new Router();
const connectionsManager = new WebSocketManager();

router.get('/upgrade', (context) => {
  if (!context.isUpgradable) {
    context.throw(501);
  }

  connectionsManager.addConnection(context.upgrade());
});

export default router;
