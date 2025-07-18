"use server";

import {
  validateEmailAddress,
  validatePhoneNumber,
} from "@/utils/verification-validation.utils";
import {
  ActionResponse,
  isActionResponse,
} from "@/types/actions-response.types";
import { logger } from "@/logger/default-logger";
import { NotificationService } from "../../services/notification-service/notification.service";
import { OutNotification } from "@/types/notification.types";
import { SessionService } from "../../services/auth-service/session.service";
import { getAuthSession } from "../auth-actions/auth.actions";
import { NOT_AUTHORIZED_RESPONSE } from "@/utils/constants.utils";

const notificationsService = new NotificationService();
const sessionService = new SessionService();

export const fetchUserNotifications = async (): Promise<
  ActionResponse<OutNotification[]>
> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const { user } = session;

    const res = await notificationsService.getUserNotifications(user.userId);
    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const readNotification = async (
  notificationId: number
): Promise<ActionResponse<OutNotification>> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const { user } = session;

    const res = await notificationsService.markNotificationAsRead(
      user.userId,
      notificationId
    );
    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const deleteNotification = async (
  notificationId: number
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const { user } = session;

    const res = await notificationsService.deleteNotification(
      user.userId,
      notificationId
    );
    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};
