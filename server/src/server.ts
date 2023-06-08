import { Application, loadEnv, Router } from "./deps.ts";

const env = await loadEnv({ allowEmptyValues: false });
const port = parseInt(env["HTTP_SERVER_PORT"]);
const router = new Router();
const app = new Application();
const connections = new Map();

const broadcast = (message) => {
  for (const connection of connections.values()) {
    connection.send(message);
  }
};

const broadcastUsernames = () => {
  const usernames = [...connections.keys()];
  broadcast(JSON.stringify({ usernames, event: "UPDATE_USERS" }));
};

router.get("/upgrade", async (context) => {
  const socket = await context.upgrade();
  const username = context.request.url.searchParams.get("username");

  if (connections.has(username)) {
    socket.close(1008, `Username ${username} is already taken.`);
  }

  socket.username = username;
  connections.set(username, socket);

  console.log(`New client connected: ${username}.`);

  socket.onopen = () => {
    broadcastUsernames();
  };

  socket.onclose = () => {
    console.log(`Client ${username} closed connection.`);
    connections.delete(username);
    broadcastUsernames();
  };

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);

    switch (data.event) {
      case "SEND_MESSAGE":
        broadcast(
          JSON.stringify({
            event: "SEND_MESSAGE",
            username: socket.username,
            message: data.message,
          }),
        );
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
