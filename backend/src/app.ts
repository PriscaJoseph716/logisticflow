import cookieParser from "cookie-parser";
import express from "express";
import path from "node:path";
import { corsMiddleware } from "./config/cors.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { router } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "12mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  app.use(router);
  app.use(errorHandler);

  return app;
}
