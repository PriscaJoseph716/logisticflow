import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const currentFilePath = fileURLToPath(import.meta.url);
const backendDirectory = resolve(dirname(currentFilePath), "..", "..");
const workspaceDirectory = resolve(backendDirectory, "..");

const dotenvPaths = [
  resolve(backendDirectory, ".env.local"),
  resolve(backendDirectory, ".env"),
  resolve(workspaceDirectory, ".env.local"),
  resolve(workspaceDirectory, ".env"),
];

for (const dotenvPath of dotenvPaths) {
  dotenv.config({
    path: dotenvPath,
    override: false,
    quiet: true,
  });
}

function firstDefined(...values: Array<string | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0);
}

const normalizedEnv = {
  ...process.env,
  APP_URL:
    firstDefined(
      process.env.APP_URL,
      process.env.RENDER_EXTERNAL_URL,
      process.env.URL,
      process.env.SERVICE_URL,
    ) ?? "http://localhost:5000",
  FRONTEND_URL:
    firstDefined(
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      process.env.ALLOWED_ORIGINS,
    ) ?? "http://127.0.0.1:5173",
  DATABASE_URL: firstDefined(
    process.env.DATABASE_URL,
    process.env.POSTGRES_INTERNAL_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ),
  JWT_ACCESS_SECRET: firstDefined(
    process.env.JWT_ACCESS_SECRET,
    process.env.ACCESS_TOKEN_SECRET,
    process.env.JWT_SECRET,
    process.env.AUTH_SECRET,
  ),
  JWT_REFRESH_SECRET: firstDefined(
    process.env.JWT_REFRESH_SECRET,
    process.env.REFRESH_TOKEN_SECRET,
    process.env.JWT_SECRET,
    process.env.AUTH_SECRET,
    process.env.JWT_ACCESS_SECRET,
    process.env.ACCESS_TOKEN_SECRET,
  ),
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  APP_NAME: z.string().default("LOGISTICSFLOW Backend"),
  APP_URL: z.string().url().default("http://localhost:5000"),
  FRONTEND_URL: z.string().default("http://127.0.0.1:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_COOKIE_NAME: z.string().default("logisticsflow_refresh_token"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  COOKIE_DOMAIN: z.string().optional().default(""),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default(""),
  SMTP_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  DEFAULT_OWNER_ROLE: z.string().default("Owner"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(200),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(20),
});

const envResult = envSchema.safeParse(normalizedEnv);

if (!envResult.success) {
  const readableIssues = envResult.error.issues
    .map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid backend environment configuration.\n${readableIssues}\n` +
      "Accepted aliases:\n" +
      "- DATABASE_URL: POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_INTERNAL_URL, POSTGRES_URL_NON_POOLING\n" +
      "- JWT_ACCESS_SECRET: ACCESS_TOKEN_SECRET, JWT_SECRET, AUTH_SECRET\n" +
      "- JWT_REFRESH_SECRET: REFRESH_TOKEN_SECRET, JWT_SECRET, AUTH_SECRET\n" +
      "- APP_URL: RENDER_EXTERNAL_URL, URL, SERVICE_URL\n" +
      "- FRONTEND_URL: CORS_ORIGIN, ALLOWED_ORIGINS",
  );
}

export const env = envResult.data;
