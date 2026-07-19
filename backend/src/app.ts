import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { corsOptions, corsOriginGuard, corsOriginLogger } from "./config/cors.js";
import { requestLogger } from "./config/logger.js";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(corsOriginLogger);
  app.use(corsOriginGuard);
  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  app.use(requestLogger);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(apiRateLimiter);

  app.get("/", (_request, response) => {
    response.json({
      success: true,
      message: "LOGISTICSFLOW backend is running.",
    });
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
