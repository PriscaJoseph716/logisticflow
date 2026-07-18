import { prisma } from "../../config/database.js";

export class RolesService {
  async listRoles(businessId: string) {
    return prisma.role.findMany({
      where: { businessId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

export const rolesService = new RolesService();
