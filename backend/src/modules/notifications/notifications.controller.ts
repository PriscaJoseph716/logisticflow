import type { Request, Response } from "express";
import { notificationsService } from "./notifications.service.js";
import type {
  NotificationCreateInput,
  NotificationListQuery,
  NotificationRouteParams,
  NotificationUpdateInput,
} from "./notifications.types.js";

export class NotificationsController {
  list = async (request: Request, response: Response) => {
    const data = await notificationsService.listNotifications(
      request.user!.businessId,
      request.query as unknown as NotificationListQuery,
    );

    response.json({ success: true, data });
  };

  getById = async (request: Request, response: Response) => {
    const data = await notificationsService.getNotificationsById(
      request.user!.businessId,
      (request.params as unknown as NotificationRouteParams).id,
    );

    response.json({ success: true, data });
  };

  create = async (request: Request, response: Response) => {
    const data = await notificationsService.createNotifications(
      request.user!.businessId,
      request.body as NotificationCreateInput,
    );

    response.status(201).json({ success: true, data });
  };

  update = async (request: Request, response: Response) => {
    const data = await notificationsService.updateNotifications(
      request.user!.businessId,
      (request.params as unknown as NotificationRouteParams).id,
      request.body as NotificationUpdateInput,
    );

    response.json({ success: true, data });
  };

  remove = async (request: Request, response: Response) => {
    await notificationsService.deleteNotifications(
      request.user!.businessId,
      (request.params as unknown as NotificationRouteParams).id,
    );

    response.status(204).send();
  };
}

export const notificationsController = new NotificationsController();
