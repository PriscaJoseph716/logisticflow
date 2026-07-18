import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { prisma } from "./config/database.js";

const app = createApp();

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`${env.APP_NAME} listening on http://0.0.0.0:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
