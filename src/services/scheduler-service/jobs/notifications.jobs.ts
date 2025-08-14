"use server";

import { NotificationService } from "@/services/notification-service/notification.service";
import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import { MAX_NOTIFICATION_AGE_IN_DAYS } from "@/utils/constants.utils";

export const deleteOldNotificationsJob = async () => {
  const jobName = `Delete Old Notifications (> ${MAX_NOTIFICATION_AGE_IN_DAYS} Days) Job`;
  const notificationsService = new NotificationService();

  try {
    logger.info(jobName + " Started");

    const res: ActionResponse =
      await notificationsService.deleteOldNotifications();

    const completionMessage = jobName + " Completed, " + res.message;

    logger.info(completionMessage);
    return Promise.resolve({
      status: res.status,
      message: completionMessage,
    });
  } catch (err) {
    logger.info(jobName + " Failed");
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};
