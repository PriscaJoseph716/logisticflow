import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword } from "../utils/hash.js";
import { parsePermissions } from "../utils/roles.js";
import { roleService } from "./role.service.js";

export class UsersService {
  async listTeam(businessId: string) {
    const users = await prisma.user.findMany({
      where: { businessId },
      include: { customRole: true },
      orderBy: { createdAt: "asc" },
    });

    return users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      roleId: user.roleId,
      roleName: user.customRole?.name ?? user.role,
      permissions:
        user.role === "OWNER"
          ? ["*"]
          : parsePermissions(user.customRole?.permissions),
      createdAt: user.createdAt,
    }));
  }

  async createWorker(
    businessId: string,
    input: {
      fullName: string;
      email: string;
      password: string;
      phone?: string;
      roleId: string;
    },
  ) {
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    const phone = input.phone?.trim() || null;

    if (!fullName || !email || !password || !input.roleId) {
      throw new AppError("fullName, email, password, and roleId are required.");
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters.");
    }

    await roleService.seedDefaultRoles(businessId);

    const role = await prisma.role.findFirst({
      where: { id: input.roleId, businessId },
    });

    if (!role) {
      throw new AppError("Selected role was not found.", 404);
    }

    const existing = await prisma.user.findUnique({
      where: {
        businessId_email: {
          businessId,
          email,
        },
      },
    });

    if (existing) {
      throw new AppError("A worker with this email already exists in your business.", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        businessId,
        fullName,
        email,
        phone,
        passwordHash,
        role: role.name.toUpperCase(),
        roleId: role.id,
      },
      include: { customRole: true },
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      roleId: user.roleId,
      roleName: user.customRole?.name ?? user.role,
      permissions: parsePermissions(user.customRole?.permissions),
      temporaryPassword: password,
    };
  }
}

export const usersService = new UsersService();
