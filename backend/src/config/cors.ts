import type { CorsOptions } from "cors";

const allowedOrigins = [
  "https://logisticflow.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    console.log("Incoming Origin:", origin);

    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
