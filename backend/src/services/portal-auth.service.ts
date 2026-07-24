import { randomBytes } from "node:crypto";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { normalizeBusinessId } from "../utils/business-id.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { signCustomerToken } from "../utils/jwt.js";
import { safeTrim } from "../utils/json.js";

function serializeBusiness(business: {
  id: string;
  businessId: string;
  companyName: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: business.id,
    businessId: business.businessId,
    companyName: business.companyName,
    name: business.companyName,
    slug: business.slug,
    createdAt: business.createdAt,
    updatedAt: business.updatedAt,
  };
}

function serializeCustomer(customer: {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  location: string;
  email: string | null;
  contactPerson: string | null;
  creditLimit: number;
  mustChangePassword: boolean;
  notifyEmail: boolean;
  notifySms: boolean;
  loginEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: customer.id,
    customerCode: customer.customerCode,
    name: customer.name,
    phone: customer.phone,
    location: customer.location,
    email: customer.email,
    contactPerson: customer.contactPerson,
    creditLimit: customer.creditLimit,
    mustChangePassword: customer.mustChangePassword,
    notifyEmail: customer.notifyEmail,
    notifySms: customer.notifySms,
    loginEnabled: customer.loginEnabled,
    lastLoginAt: customer.lastLoginAt,
    role: "CUSTOMER",
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

function generateTemporaryPassword(length = 10) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export function buildPortalLoginUrl(publicBusinessId: string) {
  // Relative path only — the admin UI prefixes the current browser origin.
  const code = String(publicBusinessId || "").trim().toUpperCase();
  return `/portal/login/${code}`;
}

export class PortalAuthService {
  async getBusinessPublic(publicBusinessId: string) {
    const code = normalizeBusinessId(publicBusinessId);
    const business = await prisma.business.findFirst({
      where: { businessId: code },
    });
    if (!business) throw new AppError("Business not found.", 404);
    return serializeBusiness(business);
  }

  async login(input: { businessId: string; customerCode: string; password: string }) {
    const publicBusinessId = normalizeBusinessId(input.businessId ?? "");
    const customerCode = safeTrim(input.customerCode).toUpperCase();
    const password = input.password ?? "";

    if (!publicBusinessId || !customerCode || !password) {
      throw new AppError("Customer ID and password are required.");
    }

    const business = await prisma.business.findFirst({
      where: { businessId: publicBusinessId },
    });
    if (!business) {
      throw new AppError("Invalid business or customer credentials.", 401);
    }

    const customer = await prisma.customer.findFirst({
      where: {
        businessId: business.id,
        customerCode: { equals: customerCode, mode: "insensitive" },
      },
    });

    if (!customer?.loginEnabled || !customer.passwordHash) {
      throw new AppError("Invalid business or customer credentials.", 401);
    }

    const valid = await verifyPassword(password, customer.passwordHash);
    if (!valid) {
      throw new AppError("Invalid business or customer credentials.", 401);
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signCustomerToken(customer.id, business.id);
    return {
      token,
      customer: serializeCustomer(customer),
      business: serializeBusiness(business),
    };
  }

  async me(customerId: string, businessId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId, loginEnabled: true },
      include: { business: true },
    });
    if (!customer) throw new AppError("Authentication required.", 401);
    return {
      customer: serializeCustomer(customer),
      business: serializeBusiness(customer.business),
    };
  }

  async changePassword(
    customerId: string,
    businessId: string,
    input: { currentPassword?: string; newPassword: string },
  ) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });
    if (!customer?.passwordHash) throw new AppError("Customer not found.", 404);

    const newPassword = input.newPassword ?? "";
    if (newPassword.length < 8) {
      throw new AppError("Password must be at least 8 characters.");
    }

    if (!customer.mustChangePassword) {
      const current = input.currentPassword ?? "";
      const valid = await verifyPassword(current, customer.passwordHash);
      if (!valid) throw new AppError("Current password is incorrect.", 401);
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    return serializeCustomer(updated);
  }
}

export const portalAuthService = new PortalAuthService();
export { generateTemporaryPassword, serializeCustomer, serializeBusiness };
