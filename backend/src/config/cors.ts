import type { CorsOptions } from "cors";
import { env } from "./env.js";

const allowedOrigins = env.FRONTEND_URL.split(",").map((origin) => origin.trim());

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
};
