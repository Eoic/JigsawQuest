import { Application, loadEnv, Router } from './deps.ts';
import { webSocketRouter } from './routes/index.ts';

const env = await loadEnv({ allowEmptyValues: false });
const port = parseInt(env['HTTP_SERVER_PORT']);
const router = new Router();
const app = new Application();

router.get('/', (context) => context.response.body = 'OK');
router.use('', webSocketRouter.routes(), webSocketRouter.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

console.info(`Listening as http://localhost:${port}`);
await app.listen({ port });
