import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import {
  AVAILABLE_PERMISSIONS,
  DEFAULT_ROLE_TEMPLATES,
  RETIRED_SYSTEM_ROLES,
  parsePermissions,
  stringifyPermissions,
} from "../utils/roles.js";

export class RoleService {
  async seedDefaultRoles(businessId: string) {
    for (const template of DEFAULT_ROLE_TEMPLATES) {
      await prisma.role.upsert({
        where: {
          businessId_name: {
            businessId,
            name: template.name,
          },
        },
        update: {},
        create: {
          businessId,
          name: template.name,
          description: template.description,
          permissions: stringifyPermissions([...template.permissions]),
          isSystem: template.isSystem,
        },
      });
    }

    for (const name of RETIRED_SYSTEM_ROLES) {
      const retired = await prisma.role.findUnique({
        where: {
          businessId_name: {
            businessId,
            name,
          },
        },
      });

      if (!retired?.isSystem) continue;

      await prisma.user.updateMany({
        where: { roleId: retired.id },
        data: { roleId: null },
      });
      await prisma.role.delete({ where: { id: retired.id } });
    }
  }

  async listRoles(businessId: string) {
    await this.seedDefaultRoles(businessId);

    const roles = await prisma.role.findMany({
      where: { businessId },
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    });

    return {
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: parsePermissions(role.permissions),
        isSystem: role.isSystem,
        userCount: role._count.users,
        createdAt: role.createdAt,
      })),
      availablePermissions: AVAILABLE_PERMISSIONS,
    };
  }

  async createRole(
    businessId: string,
    input: { name: string; description?: string; permissions?: string[] },
  ) {
    const name = input.name.trim();
    if (!name) {
      throw new AppError("Role name is required.");
    }

    const permissions = input.permissions ?? [];

    try {
      const role = await prisma.role.create({
        data: {
          businessId,
          name,
          description: input.description?.trim() ?? "",
          permissions: stringifyPermissions(permissions),
          isSystem: false,
        },
      });

      return {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: parsePermissions(role.permissions),
        isSystem: role.isSystem,
      };
    } catch (error) {
      const isUnique =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002";

      if (isUnique) {
        throw new AppError("A role with this name already exists.", 409);
      }

      throw error;
    }
  }
}

export const roleService = new RoleService();
