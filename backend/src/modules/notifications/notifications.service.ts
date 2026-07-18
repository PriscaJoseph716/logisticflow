import { AppError } from "../../utils/app-error.js";
import { notificationsRepository } from "./notifications.repository.js";
import type {
  NotificationCreateInput,
  NotificationListQuery,
  NotificationUpdateInput,
} from "./notifications.types.js";

export class NotificationsService {
  async listNotifications(businessId: string, query: NotificationListQuery) {
    return notificationsRepository.list(businessId, query);
  }

  async getNotificationsById(businessId: string, id: string) {
    const notification = await notificationsRepository.findById(businessId, id);

    if (!notification) {
      throw new AppError("Notification not found.", 404, "NOTIFICATION_NOT_FOUND");
    }

    return notification;
  }

  async createNotifications(businessId: string, input: NotificationCreateInput) {
    return notificationsRepository.create(businessId, input);
  }

  async updateNotifications(businessId: string, id: string, input: NotificationUpdateInput) {
    const notification = await notificationsRepository.update(businessId, id, input);

    if (!notification) {
      throw new AppError("Notification not found.", 404, "NOTIFICATION_NOT_FOUND");
    }

    return notification;
  }

  async deleteNotifications(businessId: string, id: string) {
    const removed = await notificationsRepository.remove(businessId, id);

    if (!removed) {
      throw new AppError("Notification not found.", 404, "NOTIFICATION_NOT_FOUND");
    }
  }
}

export const notificationsService = new NotificationsService();
