import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  businessId: string;
  typ?: "staff" | "customer";
  userId?: string;
  customerId?: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function signStaffToken(userId: string, businessId: string): string {
  return signToken({ typ: "staff", userId, businessId });
}

export function signCustomerToken(customerId: string, businessId: string): string {
  return signToken({ typ: "customer", customerId, businessId });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Invalid token payload.");
  }

  const payload = decoded as jwt.JwtPayload;
  const businessId = payload.businessId;
  const userId = payload.userId;
  const customerId = payload.customerId;
  const typ =
    payload.typ === "customer" || payload.typ === "staff"
      ? payload.typ
      : typeof customerId === "string"
        ? "customer"
        : "staff";

  if (typeof businessId !== "string") {
    throw new Error("Invalid token payload.");
  }

  if (typ === "customer") {
    if (typeof customerId !== "string") {
      throw new Error("Invalid customer token payload.");
    }
    return { typ, businessId, customerId };
  }

  if (typeof userId !== "string") {
    throw new Error("Invalid staff token payload.");
  }

  return { typ: "staff", businessId, userId };
}
