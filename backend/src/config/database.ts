import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { parse as parseConnectionString } from "pg-connection-string";
import { Pool, type PoolConfig } from "pg";
import { env } from "./env.js";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

function isLocalDatabaseHost(host?: string | null) {
  return !host || host === "localhost" || host === "127.0.0.1";
}

function buildPoolConfig(connectionString: string): PoolConfig {
  const parsedConfig = parseConnectionString(connectionString) as PoolConfig & {
    sslmode?: string;
  };
  const sslMode = parsedConfig.sslmode?.toLowerCase();

  const poolConfig: PoolConfig = {
    ...parsedConfig,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
  };

  if (sslMode !== "disable" && !isLocalDatabaseHost(poolConfig.host)) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  delete (poolConfig as PoolConfig & { sslmode?: string }).sslmode;
  return poolConfig;
}

const pool = new Pool(buildPoolConfig(env.DATABASE_URL));

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error);
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalThis.__prisma__ ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalThis.__prisma__ = prisma;
}

export async function verifyDatabaseConnection() {
  await pool.query("SELECT 1");
}
