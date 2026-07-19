import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  userId: string;
  businessId: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Invalid token payload.");
  }

  const userId = (decoded as jwt.JwtPayload).userId;
  const businessId = (decoded as jwt.JwtPayload).businessId;

  if (typeof userId !== "string" || typeof businessId !== "string") {
    throw new Error("Invalid token payload.");
  }

  return { userId, businessId };
}
