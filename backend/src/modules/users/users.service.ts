import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";

export class UsersService {
  async getCurrentUser(userId: string, businessId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        businessId,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new AppError("User not found.", 404, "USER_NOT_FOUND");
    }

    return user;
  }

  async listUsers(businessId: string) {
    return prisma.user.findMany({
      where: { businessId },
      include: {
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const usersService = new UsersService();
