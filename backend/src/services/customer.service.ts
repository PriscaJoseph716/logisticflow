import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword } from "../utils/hash.js";
import { safeTrim } from "../utils/json.js";
import {
  buildPortalLoginUrl,
  generateTemporaryPassword,
} from "./portal-auth.service.js";

export class CustomerService {
  async list(businessId: string) {
    const items = await prisma.customer.findMany({
      where: { businessId },
      include: { _count: { select: { shipments: true } } },
      orderBy: { createdAt: "desc" },
    });

    return items.map(({ _count, passwordHash: _passwordHash, ...item }) => ({
      ...item,
      shipmentsCount: _count.shipments,
      hasPortalLogin: Boolean(item.loginEnabled),
    }));
  }

  async create(
    businessId: string,
    input: {
      customerCode: string;
      name: string;
      phone?: string | null;
      location?: string | null;
      email?: string | null;
      contactPerson?: string | null;
      notes?: string | null;
      enableLogin?: boolean;
      creditLimit?: number;
    },
  ) {
    const customerCode = safeTrim(input.customerCode).toUpperCase();
    const name = safeTrim(input.name);
    if (!customerCode || !name) {
      throw new AppError("customerCode and name are required.");
    }

    let passwordHash: string | null = null;
    let temporaryPassword: string | null = null;
    const enableLogin = Boolean(input.enableLogin);

    if (enableLogin) {
      temporaryPassword = generateTemporaryPassword();
      passwordHash = await hashPassword(temporaryPassword);
    }

    const customer = await prisma.customer.create({
      data: {
        businessId,
        customerCode,
        name,
        phone: safeTrim(input.phone),
        location: safeTrim(input.location),
        email: safeTrim(input.email) || null,
        contactPerson: safeTrim(input.contactPerson) || null,
        notes: safeTrim(input.notes) || null,
        loginEnabled: enableLogin,
        passwordHash,
        mustChangePassword: enableLogin,
        creditLimit: Number(input.creditLimit ?? 0),
      },
    });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    const loginUrl = business ? buildPortalLoginUrl(business.businessId) : "/portal/login";

    const { passwordHash: _omit, ...safeCustomer } = customer;
    return {
      ...safeCustomer,
      hasPortalLogin: enableLogin,
      portalCredentials: enableLogin
        ? {
            customerName: customer.name,
            customerId: customer.customerCode,
            temporaryPassword,
            loginUrl,
            businessId: business?.businessId ?? "",
            companyName: business?.companyName ?? "",
          }
        : null,
    };
  }

  async update(
    businessId: string,
    id: string,
    input: {
      customerCode?: string | null;
      name?: string | null;
      phone?: string | null;
      location?: string | null;
      email?: string | null;
      contactPerson?: string | null;
      notes?: string | null;
      creditLimit?: number;
    },
  ) {
    const existing = await prisma.customer.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Customer not found.", 404);

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(input.customerCode !== undefined
          ? { customerCode: safeTrim(input.customerCode).toUpperCase() }
          : {}),
        ...(input.name !== undefined ? { name: safeTrim(input.name) } : {}),
        ...(input.phone !== undefined ? { phone: safeTrim(input.phone) } : {}),
        ...(input.location !== undefined ? { location: safeTrim(input.location) } : {}),
        ...(input.email !== undefined ? { email: safeTrim(input.email) || null } : {}),
        ...(input.contactPerson !== undefined
          ? { contactPerson: safeTrim(input.contactPerson) || null }
          : {}),
        ...(input.notes !== undefined ? { notes: safeTrim(input.notes) || null } : {}),
        ...(input.creditLimit !== undefined ? { creditLimit: Number(input.creditLimit) } : {}),
      },
    });

    const { passwordHash: _omit, ...safe } = updated;
    return { ...safe, hasPortalLogin: Boolean(updated.loginEnabled) };
  }

  async enablePortalLogin(businessId: string, id: string, enable: boolean) {
    const existing = await prisma.customer.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Customer not found.", 404);

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new AppError("Business not found.", 404);

    if (!enable) {
      const updated = await prisma.customer.update({
        where: { id },
        data: {
          loginEnabled: false,
        },
      });
      const { passwordHash: _omit, ...safe } = updated;
      return { ...safe, hasPortalLogin: false, portalCredentials: null };
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        loginEnabled: true,
        passwordHash,
        mustChangePassword: true,
      },
    });

    const { passwordHash: _omit, ...safe } = updated;
    return {
      ...safe,
      hasPortalLogin: true,
      portalCredentials: {
        customerName: updated.name,
        customerId: updated.customerCode,
        temporaryPassword,
        loginUrl: buildPortalLoginUrl(business.businessId),
        businessId: business.businessId,
        companyName: business.companyName,
      },
    };
  }

  async remove(businessId: string, id: string) {
    const existing = await prisma.customer.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Customer not found.", 404);
    await prisma.customer.delete({ where: { id } });
    return { id };
  }
}

export const customerService = new CustomerService();
