import { Notification } from "@prisma/client";

export type NotificationType = "General" | "Quotation Followup";

export type NotificationTemplateNames =
  | "firstTime_created"
  | "lastTime_created"
  | "firstTime_sent"
  | "lastTime_sent";

export type NewNotification = Omit<Notification, "id" | "deleted" | "isRead">;

export type QuotationFollowUpNotificationData = {
  id: string;
  client: string;
  date: string;
};

export type OutNotification = Omit<
  Notification,
  "deleted" | "time" | "isRead"
> & {
  time: number;
  isRead: boolean;
  type: NotificationType;
};

export type NotificationsCount = {
  total: number;
  read: number;
  unread: number;
};
