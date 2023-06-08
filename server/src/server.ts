import { Application, loadEnv, Router } from "./deps.ts";

const env = await loadEnv({ allowEmptyValues: false });
const port = parseInt(env["HTTP_SERVER_PORT"]);
const router = new Router();
const app = new Application();
const connections = new Map();

const broadcast = (message: any) => {
  for (const connection of connections.values()) {
    if (connection.readyState === 1) {
      connection.send(message);
    }
  }
};

router.get("/upgrade", async (context) => {
  const socket = await context.upgrade();
  const username = crypto.randomUUID()

  if (connections.has(username)) {
    socket.close(1008, `Username ${username} is already taken.`);
  }

  socket.username = username;
  connections.set(username, socket);
  console.log(`New client connected: ${username}.`);
 
  socket.onopen = () => {
    broadcast(JSON.stringify({ type: 'S_CONNECTED_USERS', payload: [...connections.keys()] }));
  };

  socket.onclose = () => {
    console.log(`Client ${username} closed connection.`);
    connections.delete(username);
    broadcast(JSON.stringify({ type: 'S_USER_DISCONNECTED', payload: username }));
  };

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);

    switch (data.type) {
      case 'C_CURSOR_POSITION':
        console.log(data);
        break;

      default:
        return;
    }
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Listening as http://localhost:" + port);
await app.listen({ port });
