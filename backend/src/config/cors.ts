import type { CorsOptions } from "cors";
import { env } from "./env.js";

const allowedOrigins = new Set(
  env.FRONTEND_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean),
);

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
