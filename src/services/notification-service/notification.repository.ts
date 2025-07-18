import { logger } from "@/logger/default-logger";
import {
  NewNotification,
  NotificationsCount,
  NotificationType,
  OutNotification,
  QuotationFollowUpNotificationData,
} from "@/types/notification.types";
import { MAX_NOTIFICATION_AGE_IN_DAYS } from "@/utils/constants.utils";
import { daysToMilliseconds } from "@/utils/time-converters.utils";
import { Notification, PrismaClient } from "@prisma/client";

export class NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  getUserNotificationsCount = async (
    userId: number
  ): Promise<NotificationsCount> => {
    try {
      const [total, read] = await Promise.all([
        this.prisma.notification.count({
          where: {
            userId: userId,
            deleted: 0,
          },
        }),
        this.prisma.notification.count({
          where: {
            userId: userId,
            isRead: 1,
            deleted: 0,
          },
        }),
      ]);

      return Promise.resolve({
        total: total,
        read: read,
        unread: total - read,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchUserNotifications = async (
    userId: number
  ): Promise<OutNotification[]> => {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId: userId,
          deleted: 0,
        },
        orderBy: { id: "desc" },
        include: {
          template: true,
          type: true,
        },
      });

      const formatted: OutNotification[] = [];

      const formatMessage = (
        template: string,
        data: QuotationFollowUpNotificationData
      ): string => {
        return template.replace(
          /{(.*?)}/g,
          (_, key) => (data as any)[key] || ""
        );
      };

      for (const notifi of notifications) {
        const { type, template, deleted, time, isRead, ...rest } = notifi;

        if (!template) {
          formatted.push({
            ...rest,
            time: Number(time),
            isRead: Boolean(isRead),
            type: type.type as NotificationType,
          });
          continue;
        }

        try {
          const messageData = JSON.parse(
            notifi.message
          ) as QuotationFollowUpNotificationData;

          formatted.push({
            ...rest,
            message: formatMessage(template.template, messageData),
            time: Number(time),
            isRead: Boolean(isRead),
            type: type.type as NotificationType,
          });
        } catch (err) {
          logger.error(err);
          logger.error(
            `Invalid Notification ${notifi.id} Data:  + ${notifi.message}`
          );
          continue;
        }
      }

      return Promise.resolve(formatted);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  recordNewNotification = async (
    notification: NewNotification
  ): Promise<Notification> => {
    try {
      const newNotification = await this.prisma.notification.create({
        data: notification,
      });

      return Promise.resolve(newNotification);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  recordNewNotificationsInBatch = async (
    notifications: NewNotification[]
  ): Promise<number> => {
    try {
      const newNotification = await this.prisma.notification.createMany({
        data: notifications,
      });

      return Promise.resolve(newNotification.count);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  tagNotificationAsRead = async (
    userId: number,
    notificationId: number
  ): Promise<Notification | null> => {
    try {
      const updatedNotification = await this.prisma.notification.update({
        where: {
          userId: userId,
          id: notificationId,
        },
        data: {
          isRead: 1,
        },
      });

      if (!updatedNotification) return Promise.resolve(null);

      return Promise.resolve(updatedNotification);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  tagNotificationAsDeleted = async (
    userId: number,
    notificationId: number
  ): Promise<Notification | null> => {
    try {
      const updatedNotification = await this.prisma.notification.update({
        where: {
          userId: userId,
          id: notificationId,
        },
        data: {
          deleted: 1,
        },
      });

      if (!updatedNotification) return Promise.resolve(null);

      return Promise.resolve(updatedNotification);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteOldNotifications = async (): Promise<number> => {
    try {
      const timeThreshold =
        new Date().getTime() - daysToMilliseconds(MAX_NOTIFICATION_AGE_IN_DAYS);

      const updatedNotification = await this.prisma.notification.deleteMany({
        where: {
          time: { lte: BigInt(timeThreshold) },
        },
      });

      return Promise.resolve(updatedNotification.count);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };
}
