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

const customerPortalDefault =
  NODE_ENV === "production" ? "https://portal.logisticflow.app" : "http://localhost:5173";

const customerPortalUrl = optional(
  "CUSTOMER_PORTAL_URL",
  optional("PORTAL_URL", customerPortalDefault),
).replace(/\/+$/, "");

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
  /** Customer portal origin. Login links: `{CUSTOMER_PORTAL_URL}/login/LOG-0001` */
  CUSTOMER_PORTAL_URL: customerPortalUrl,
  /** @deprecated Use CUSTOMER_PORTAL_URL */
  PORTAL_URL: customerPortalUrl,
};

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://logisticflow.vercel.app",
  "https://www.logisticflow.vercel.app",
  "https://portal.logisticflow.vercel.app",
  "https://portal.logisticflow.app",
  "https://app.logisticflow.com",
  "https://portal.logisticflow.com",
];

export const allowedOrigins = Array.from(
  new Set(
    [env.FRONTEND_URL, env.CUSTOMER_PORTAL_URL]
      .join(",")
      .split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean)
      .concat(DEFAULT_ORIGINS)
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
