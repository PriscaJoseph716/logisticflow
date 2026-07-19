import { createApp } from "./app.js";
import { prisma } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureDatabaseSchema } from "./utils/ensure-schema.js";

async function start() {
  await prisma.$connect();
  console.info("[boot] database connected");

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
