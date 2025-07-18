import { ActionResponse } from "@/types/actions-response.types";
import prisma from "../../../db/db";
import { NotificationRepository } from "./notification.repository";
import { logger } from "@/logger/default-logger";
import {
  NewNotification,
  NotificationsCount,
  OutNotification,
} from "@/types/notification.types";

export class NotificationService {
  private static notificationsRepo: NotificationRepository;

  static {
    this.notificationsRepo = new NotificationRepository(prisma);
  }

  constructor() {}

  getUserNotifications = async (
    userId: number
  ): Promise<ActionResponse<OutNotification[]>> => {
    try {
      const notifications =
        await NotificationService.notificationsRepo.fetchUserNotifications(
          userId
        );

      const res: ActionResponse<OutNotification[]> = {
        status: true,
        message: "Successful",
        data: notifications,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  markNotificationAsRead = async (
    userId: number,
    notificationId: number
  ): Promise<ActionResponse> => {
    try {
      const updatedNotification =
        await NotificationService.notificationsRepo.tagNotificationAsRead(
          userId,
          notificationId
        );

      if (!updatedNotification) {
        const res: ActionResponse = {
          status: false,
          message: "Notification not found",
        };
        return Promise.resolve(res);
      }

      const res: ActionResponse = {
        status: true,
        message: "Successful",
      };
      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  static getUserNotificationsCounts = async (
    userId: number
  ): Promise<ActionResponse<NotificationsCount>> => {
    try {
      const notificationsCounts =
        await NotificationService.notificationsRepo.getUserNotificationsCount(
          userId
        );

      const res: ActionResponse<NotificationsCount> = {
        status: true,
        message: "Successful",
        data: notificationsCounts,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteNotification = async (
    userId: number,
    notificationId: number
  ): Promise<ActionResponse> => {
    try {
      const updatedNotification =
        await NotificationService.notificationsRepo.tagNotificationAsDeleted(
          userId,
          notificationId
        );

      if (!updatedNotification) {
        const res: ActionResponse = {
          status: false,
          message: "Notification not found",
        };
        return Promise.resolve(res);
      }

      const res: ActionResponse = {
        status: true,
        message: "Successful",
      };
      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  static recordNewNotification = async (
    notification: NewNotification
  ): Promise<ActionResponse> => {
    try {
      const updatedNotification =
        await this.notificationsRepo.recordNewNotification(notification);

      if (!updatedNotification) {
        const res: ActionResponse = {
          status: false,
          message: "Notification not found",
        };
        return Promise.resolve(res);
      }

      const res: ActionResponse = {
        status: true,
        message: "Successful",
      };
      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  static recordNewNotificationsBatch = async (
    notifications: NewNotification[]
  ): Promise<ActionResponse> => {
    try {
      const insertedCount =
        await this.notificationsRepo.recordNewNotificationsInBatch(
          notifications
        );

      const res: ActionResponse = {
        status: true,
        message: insertedCount + " Successful",
      };
      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteOldNotifications = async (): Promise<ActionResponse> => {
    try {
      const deletedCount =
        await NotificationService.notificationsRepo.deleteOldNotifications();

      const res: ActionResponse<OutNotification[]> = {
        status: true,
        message: `Successful: ${deletedCount} Old Notification Deleted`,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };
}
