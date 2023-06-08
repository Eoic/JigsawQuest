import { load } from "https://deno.land/std@0.190.0/dotenv/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v12.5.0/mod.ts";

export { Application, Router, load as loadEnv };