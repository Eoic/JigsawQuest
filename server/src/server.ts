import { Application, loadEnv, Router } from "./deps.ts";
import { webSocketRouter } from "./routes/index.ts";

const env = await loadEnv({ allowEmptyValues: false });
const port = parseInt(env["HTTP_SERVER_PORT"]);
const router = new Router();
const app = new Application();

router.use('', webSocketRouter.routes(), webSocketRouter.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Listening as http://localhost:${port}`);
await app.listen({ port });
