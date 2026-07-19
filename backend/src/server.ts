import { createApp } from "./app.js";
import { prisma } from "./config/database.js";
import { allowedOrigins, env } from "./config/env.js";
import { ensureDatabaseSchema } from "./utils/ensure-schema.js";

async function start() {
  await prisma.$connect();
  console.info("[boot] database connected");
  console.info(`[boot] cookie secure=${env.COOKIE_SECURE} sameSite=${env.COOKIE_SECURE ? "none" : "lax"}`);
  console.info(`[boot] allowed origins: ${allowedOrigins.join(", ")}`);

  await ensureDatabaseSchema();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.info(`[boot] backend listening on port ${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("[boot] failed to start backend", error);
  process.exit(1);
});
