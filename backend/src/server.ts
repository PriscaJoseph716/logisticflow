import { createApp } from "./app.js";
import { prisma, verifyDatabaseConnection } from "./config/database.js";
import { env } from "./config/env.js";

const app = createApp();
let server: ReturnType<typeof app.listen> | undefined;

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  if (!server) {
    await prisma.$disconnect();
    process.exit(0);
    return;
  }

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

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection during runtime:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception during runtime:", error);
  void prisma.$disconnect().finally(() => {
    process.exit(1);
  });
});

async function startServer() {
  try {
    await verifyDatabaseConnection();
    server = app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`${env.APP_NAME} listening on http://0.0.0.0:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL during startup:", error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void startServer();
