import dotenv from "dotenv";

dotenv.config();

function required(name: string, aliases: string[] = []): string {
  const names = [name, ...aliases];
  for (const key of names) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

function optional(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

const NODE_ENV = optional("NODE_ENV", "development");

export const env = {
  NODE_ENV,
  PORT: Number(optional("PORT", "5000")),
  DATABASE_URL: required("DATABASE_URL"),
  // Accept legacy Render secret name from the previous backend.
  JWT_SECRET: required("JWT_SECRET", ["JWT_ACCESS_SECRET"]),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "7d"),
  COOKIE_NAME: optional("COOKIE_NAME", "lf_token"),
  // Cross-site cookies (Vercel → Render) require Secure + SameSite=None.
  COOKIE_SECURE:
    optional("COOKIE_SECURE", NODE_ENV === "production" ? "true" : "false") === "true",
  FRONTEND_URL: optional("FRONTEND_URL", "http://localhost:5173"),
};

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://logisticflow.vercel.app",
  "https://www.logisticflow.vercel.app",
];

export const allowedOrigins = Array.from(
  new Set(
    env.FRONTEND_URL.split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean)
      .concat(DEFAULT_ORIGINS),
  ),
);
