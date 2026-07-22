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
  PORTAL_COOKIE_NAME: optional("PORTAL_COOKIE_NAME", "lf_portal_token"),
  // Cross-site cookies (Vercel → Render) require Secure + SameSite=None.
  // Force Secure in production even if an old Render env still says COOKIE_SECURE=false.
  COOKIE_SECURE:
    NODE_ENV === "production"
      ? true
      : optional("COOKIE_SECURE", "false") === "true",
  FRONTEND_URL: optional("FRONTEND_URL", "http://localhost:5173"),
  PORTAL_URL: optional("PORTAL_URL", "http://localhost:5173/portal"),
};

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://logisticflow.vercel.app",
  "https://www.logisticflow.vercel.app",
  "https://portal.logisticflow.vercel.app",
  "https://app.logisticflow.com",
  "https://portal.logisticflow.com",
];

export const allowedOrigins = Array.from(
  new Set(
    [env.FRONTEND_URL, env.PORTAL_URL]
      .join(",")
      .split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean)
      .concat(DEFAULT_ORIGINS)
      // Allow portal path origins without trailing path for CORS host matching
      .flatMap((origin) => {
        try {
          const url = new URL(origin.includes("://") ? origin : `https://${origin}`);
          return [`${url.protocol}//${url.host}`];
        } catch {
          return [origin];
        }
      }),
  ),
);
