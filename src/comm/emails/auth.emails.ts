"use server";
import { UserRegInfo } from "@/types/user.types";
import { emailVerCodeOtpEmailTemplate } from "./templates/email-verification-otp-mail-template";
import { SendEmailDto } from "@/types/communication.types";
import { systemEmailSender } from "@/utils/communication.utils";
import { sendEmail } from "@/comm/emails/emails.config";
import { logger } from "@/logger/default-logger";

export const sendEmailVerificationOtp = async ({
  userInfo,
  verCode,
}: {
  userInfo: UserRegInfo;
  verCode: number;
}): Promise<boolean> => {
  try {
    const emailContent: string | null = emailVerCodeOtpEmailTemplate({
      firstName: userInfo.firstName!,
      verCode: String(verCode),
    });

    if (!emailContent) throw Error("Verification Code Email content is null.");

    const emailData: SendEmailDto = {
      recipients: [
        {
          name: userInfo.firstName!,
          address: userInfo.email!,
        },
      ],
      sender: systemEmailSender,
      subject: `Email Verification - ${verCode}`,
      message: emailContent,
      isHtml: true,
    };

    const sendEmailRes = await sendEmail(emailData);

    if (sendEmailRes.accepted.length < 1) {
      logger.error("Failed to send Verification Code email:", sendEmailRes);
      return Promise.resolve(false);
    } else {
      logger.info("Verification Code email Sent successfully");
      return Promise.resolve(true);
    }
  } catch (err) {
    logger.error(err);
    return Promise.resolve(false);
  }
};
