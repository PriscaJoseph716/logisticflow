import type { Request, Response } from "express";
import { businessService } from "./business.service.js";

export class BusinessController {
  me = async (request: Request, response: Response) => {
    const business = await businessService.getCurrentBusiness(request.user!.businessId);
    response.json({
      success: true,
      data: business,
    });
  };
}

export const businessController = new BusinessController();
