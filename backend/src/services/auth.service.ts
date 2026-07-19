import type { Business, Role, User } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { normalizeBusinessId, slugifyCompanyName } from "../utils/business-id.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";
import { OWNER_PERMISSIONS, parsePermissions } from "../utils/roles.js";
import { businessService } from "./business.service.js";
import { roleService } from "./role.service.js";

export type RegisterInput = {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
};

export type LoginInput = {
  businessId: string;
  /** Email or full name */
  email?: string;
  identifier?: string;
  password: string;
};

type UserWithRole = User & {
  customRole?: Role | null;
};

function serializeUser(user: UserWithRole) {
  const permissions =
    user.role === "OWNER"
      ? [...OWNER_PERMISSIONS]
      : parsePermissions(user.customRole?.permissions);

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    roleId: user.roleId,
    roleName: user.role === "OWNER" ? "Owner" : user.customRole?.name ?? user.role,
    permissions,
    businessId: user.businessId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function serializeBusiness(business: Business) {
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

function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export class AuthService {
  async register(input: RegisterInput) {
    const fullName = input.fullName.trim();
    const companyName = input.companyName.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!fullName || !companyName || !email || !password) {
      throw new AppError("fullName, companyName, email, and password are required.");
    }

    if (!email.includes("@")) {
      throw new AppError("A valid email is required.");
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters.");
    }

    const passwordHash = await hashPassword(password);
    const baseSlug = slugifyCompanyName(companyName);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        const { user, business } = await prisma.$transaction(async (tx) => {
          const publicBusinessId = await businessService.getNextBusinessId(tx);
          const slug = `${baseSlug}-${publicBusinessId.toLowerCase()}`;

          const business = await tx.business.create({
            data: {
              businessId: publicBusinessId,
              companyName,
              slug,
            },
          });

          const user = await tx.user.create({
            data: {
              fullName,
              email,
              passwordHash,
              role: "OWNER",
              businessId: business.id,
            },
          });

          return { user, business };
        });

        await roleService.seedDefaultRoles(business.id);

        const token = signToken({
          userId: user.id,
          businessId: business.id,
        });

        return {
          token,
          user: serializeUser(user),
          business: serializeBusiness(business),
        };
      } catch (error) {
        if (isUniqueConflict(error)) {
          continue;
        }

        throw error;
      }
    }

    throw new AppError("Unable to create a unique business identity.", 500);
  }

  async login(input: LoginInput) {
    const publicBusinessId = normalizeBusinessId(input.businessId ?? "");
    const identifier = (input.identifier ?? input.email ?? "").trim();
    const password = input.password;

    if (!publicBusinessId || !identifier || !password) {
      throw new AppError("Business ID, name or email, and password are required.");
    }

    const business = await prisma.business.findUnique({
      where: { businessId: publicBusinessId },
    });

    if (!business) {
      throw new AppError("Invalid business ID, login, or password.", 401);
    }

    const matches = await prisma.user.findMany({
      where: {
        businessId: business.id,
        OR: [
          { email: identifier.toLowerCase() },
          { fullName: { equals: identifier, mode: "insensitive" } },
        ],
      },
      include: { business: true, customRole: true },
      take: 5,
    });

    if (!matches.length) {
      throw new AppError("Invalid business ID, login, or password.", 401);
    }

    if (matches.length > 1) {
      throw new AppError("Multiple workers share that name. Please sign in with email.", 401);
    }

    const user = matches[0]!;

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid business ID, login, or password.", 401);
    }

    if (user.role === "OWNER") {
      await roleService.seedDefaultRoles(user.businessId);
    }

    const token = signToken({
      userId: user.id,
      businessId: user.businessId,
    });

    return {
      token,
      user: serializeUser(user),
      business: serializeBusiness(user.business),
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true, customRole: true },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return {
      user: serializeUser(user),
      business: serializeBusiness(user.business),
    };
  }
}

export const authService = new AuthService();
