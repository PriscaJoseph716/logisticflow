import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";

export class BusinessService {
  async getCurrentBusiness(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { businessId },
      include: {
        settings: true,
      },
    });

    if (!business) {
      throw new AppError("Business not found.", 404, "BUSINESS_NOT_FOUND");
    }

    return business;
  }
}

export const businessService = new BusinessService();
