import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { pool, prisma } from "../config/database.js";

type PrismaCommand = {
  command: string;
  args: string[];
};

/** Idempotent SQL matching the current Prisma schema (final shape). */
const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS "Business" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Business_businessId_key" ON "Business"("businessId");
CREATE UNIQUE INDEX IF NOT EXISTS "Business_slug_key" ON "Business"("slug");

CREATE TABLE IF NOT EXISTS "Role" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "permissions" TEXT NOT NULL DEFAULT '[]',
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Role_businessId_idx" ON "Role"("businessId");
CREATE UNIQUE INDEX IF NOT EXISTS "Role_businessId_name_key" ON "Role"("businessId", "name");

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'OWNER',
  "roleId" TEXT,
  "businessId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "User_businessId_idx" ON "User"("businessId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_businessId_email_key" ON "User"("businessId", "email");

CREATE TABLE IF NOT EXISTS "Assignment" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "workerId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "dueDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Assignment_businessId_idx" ON "Assignment"("businessId");
CREATE INDEX IF NOT EXISTS "Assignment_workerId_idx" ON "Assignment"("workerId");
CREATE INDEX IF NOT EXISTS "Assignment_status_idx" ON "Assignment"("status");

CREATE TABLE IF NOT EXISTS "Proof" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Proof_assignmentId_idx" ON "Proof"("assignmentId");

DO $$ BEGIN
  ALTER TABLE "Role" ADD CONSTRAINT "Role_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_workerId_fkey"
    FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Proof" ADD CONSTRAINT "Proof_assignmentId_fkey"
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Proof" ADD CONSTRAINT "Proof_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

function resolvePrismaCommand(): PrismaCommand | null {
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

  return null;
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
  const command = resolvePrismaCommand();
  if (!command) {
    throw new Error("Prisma CLI not found");
  }

  console.info("[boot] syncing database schema with prisma db push...");
  execFileSync(command.command, command.args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
}

async function runSqlBootstrap() {
  console.info("[boot] applying SQL schema bootstrap...");
  await pool.query(BOOTSTRAP_SQL);
}

/**
 * Ensures production DB matches Prisma schema before the API accepts traffic.
 */
export async function ensureDatabaseSchema() {
  if (await businessTableExists()) {
    console.info("[boot] database schema ready");
    return;
  }

  console.warn('[boot] "Business" table missing — applying schema');

  try {
    runDbPush();
  } catch (error) {
    console.warn("[boot] prisma db push failed, falling back to SQL bootstrap", error);
    await runSqlBootstrap();
  }

  if (!(await businessTableExists())) {
    // Last resort: SQL bootstrap even if db push claimed success but table missing.
    await runSqlBootstrap();
  }

  if (!(await businessTableExists())) {
    throw new Error('Schema sync finished but "Business" table is still missing.');
  }

  console.info("[boot] database schema applied");
}
