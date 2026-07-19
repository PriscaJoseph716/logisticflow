import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "../config/database.js";

type PrismaCommand = {
  command: string;
  args: string[];
};

function resolvePrismaCommand(): PrismaCommand {
  const jsEntry = [
    path.resolve(process.cwd(), "node_modules", "prisma", "build", "index.js"),
    path.resolve(process.cwd(), "..", "node_modules", "prisma", "build", "index.js"),
  ].find((candidate) => existsSync(candidate));

  if (jsEntry) {
    return {
      command: process.execPath,
      args: [jsEntry, "db", "push", "--accept-data-loss", "--skip-generate"],
    };
  }

  const binEntry = [
    path.resolve(process.cwd(), "node_modules", ".bin", "prisma"),
    path.resolve(process.cwd(), "..", "node_modules", ".bin", "prisma"),
  ].find((candidate) => existsSync(candidate));

  if (binEntry) {
    return {
      command: binEntry,
      args: ["db", "push", "--accept-data-loss", "--skip-generate"],
    };
  }

  throw new Error("Prisma CLI not found. Ensure prisma is installed as a dependency.");
}

async function businessTableExists(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "Business" LIMIT 1`;
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("42P01") || message.toLowerCase().includes("does not exist")) {
      return false;
    }
    throw error;
  }
}

function runDbPush() {
  const { command, args } = resolvePrismaCommand();
  console.info("[boot] syncing database schema with prisma db push...");
  execFileSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
}

/**
 * Ensures production DB matches Prisma schema before the API accepts traffic.
 * Render start-command overrides often skip shell-level migrate/db push.
 */
export async function ensureDatabaseSchema() {
  if (await businessTableExists()) {
    console.info("[boot] database schema ready");
    return;
  }

  console.warn('[boot] "Business" table missing — applying schema');
  runDbPush();

  if (!(await businessTableExists())) {
    throw new Error('Schema sync finished but "Business" table is still missing.');
  }

  console.info("[boot] database schema applied");
}
