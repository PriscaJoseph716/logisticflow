import morgan from "morgan";
import { env } from "./env.js";

export const requestLogger = morgan(env.NODE_ENV === "production" ? "combined" : "dev");
