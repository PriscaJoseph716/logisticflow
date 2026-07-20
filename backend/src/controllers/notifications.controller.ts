import type { Request, Response } from "express";

export class NotificationsController {
  list = async (_request: Request, response: Response) => {
    response.json({ success: true, items: [] });
  };
}

export const notificationsController = new NotificationsController();
