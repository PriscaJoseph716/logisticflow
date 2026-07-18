import type { CorsOptions } from "cors";
import { env } from "./env.js";

const localOrigins = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);

const allowedOrigins = env.FRONTEND_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isVercelPreviewOrigin(origin: string) {
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || localOrigins.has(origin) || allowedOrigins.includes(origin) || isVercelPreviewOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
};
