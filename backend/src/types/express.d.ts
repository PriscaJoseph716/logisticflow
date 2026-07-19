import type { Business, Role, User } from "@prisma/client";

export type AuthUser = User & {
  business: Business;
  customRole?: Role | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
