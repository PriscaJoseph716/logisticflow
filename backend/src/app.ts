import cookieParser from "cookie-parser";
import express from "express";
import path from "node:path";
import { corsMiddleware } from "./config/cors.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { router } from "./routes/index.js";

export function createApp() {
  const app = express();

  // Required behind Render/Cloudflare so Express trusts X-Forwarded-* headers.
  app.set("trust proxy", 1);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "12mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  // Render health checks hit /health at the service root.
  app.get("/health", (_request, response) => {
    response.status(200).json({ success: true, message: "ok" });
  });

  app.use(router);
  app.use(errorHandler);

  return app;
}
