import type { Business, Role, User } from "@prisma/client";
import type { PortalCustomer } from "../middlewares/portal-auth.middleware.js";

export type AuthUser = User & {
  business: Business;
  customRole?: Role | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      portalCustomer?: PortalCustomer;
    }
  }
}

export {};
