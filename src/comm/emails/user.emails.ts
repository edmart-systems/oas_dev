"use server";

import { User } from "@prisma/client";
import { newAccountEmailTemplate } from "./templates/new-account-mail-template";
import { systemEmailSender } from "@/utils/communication.utils";
import { sendEmail } from "@/comm/emails/emails.config";
import { approvedAccountEmailTemplate } from "./templates/approved-account-mail-template";
import { SendEmailDto } from "@/types/communication.types";
import { logger } from "@/logger/default-logger";
import { passwordResetEmailTemplate } from "./templates/password-reset-link-mail-template";

export const sendNewAccountEmail = async (user: User): Promise<boolean> => {
  try {
    const emailContent: string | null = newAccountEmailTemplate({
      firstName: user.firstName,
    });

    if (!emailContent) throw Error("New Account Email content is null.");

    const emailData: SendEmailDto = {
      recipients: [
        {
          name: user.firstName,
          address: user.email,
        },
      ],
      sender: systemEmailSender,
      subject: `New Account`,
      message: emailContent,
      isHtml: true,
    };

    const sendEmailRes = await sendEmail(emailData);

    if (sendEmailRes.accepted.length < 1) {
      logger.error("Failed to send New Account Email:", sendEmailRes);
      return Promise.resolve(false);
    } else {
      logger.info("New Account Email Sent successfully");
      return Promise.resolve(true);
    }
  } catch (err) {
    logger.error(err);
    return Promise.resolve(false);
  }
};

export const sendAccountApprovedEmail = async (
  user: User
): Promise<boolean> => {
  try {
    const emailContent: string | null = approvedAccountEmailTemplate({
      firstName: user.firstName,
      co_user_id: user.co_user_id,
    });

    if (!emailContent) throw Error("Account Approved Email content is null.");

    const emailData: SendEmailDto = {
      recipients: [
        {
          name: user.firstName,
          address: user.email,
        },
      ],
      sender: systemEmailSender,
      subject: `Account Approved`,
      message: emailContent,
      isHtml: true,
    };

    const sendEmailRes = await sendEmail(emailData);

    if (sendEmailRes.accepted.length < 1) {
      logger.error("Failed to send Account Approved Email:", sendEmailRes);
      return Promise.resolve(false);
    } else {
      logger.info("Account Approved Email Sent successfully");
      return Promise.resolve(true);
    }
  } catch (err) {
    logger.error(err);
    return Promise.resolve(false);
  }
};

export const sendPasswordResetEmail = async ({
  user,
  resetLink,
  expires_at,
}: {
  user: User;
  resetLink: string;
  expires_at: Date;
}): Promise<boolean> => {
  try {
    const emailContent: string | null = passwordResetEmailTemplate({
      firstName: user.firstName,
      resetLink,
      expiresAt: expires_at,
    });

    if (!emailContent) throw Error("Password Reset Email content is null.");

    const emailData: SendEmailDto = {
      recipients: [
        {
          name: user.firstName,
          address: user.email,
        },
      ],
      sender: systemEmailSender,
      subject: `Password Reset Request`,
      message: emailContent,
      isHtml: true,
    };

    const sendEmailRes = await sendEmail(emailData);

    if (sendEmailRes.accepted.length < 1) {
      logger.error("Failed to send Password Reset Email:", sendEmailRes);
      return Promise.resolve(false);
    } else {
      logger.info("Password Reset Email sent successfully");
      return Promise.resolve(true);
    }
  } catch (err) {
    logger.error(err);
    return Promise.resolve(false);
  }
};