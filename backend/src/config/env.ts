import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: Number(optional("PORT", "5000")),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "7d"),
  COOKIE_NAME: optional("COOKIE_NAME", "lf_token"),
  COOKIE_SECURE: optional("COOKIE_SECURE", "false") === "true",
  FRONTEND_URL: optional("FRONTEND_URL", "http://localhost:5173").replace(/\/+$/, ""),
};

export const allowedOrigins = Array.from(
  new Set([env.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"]),
);
