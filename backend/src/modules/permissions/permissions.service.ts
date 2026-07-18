import { prisma } from "../../config/database.js";

export class PermissionsService {
  async listPermissions(businessId: string) {
    return prisma.permission.findMany({
      where: { businessId },
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    });
  }
}

export const permissionsService = new PermissionsService();
