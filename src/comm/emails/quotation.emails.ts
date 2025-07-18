"use server";

import { systemEmailSender } from "@/utils/communication.utils";
import { sendEmail } from "@/comm/emails/emails.config";
import { SendEmailDto } from "@/types/communication.types";
import { logger } from "@/logger/default-logger";
import { quotationTagEmailTemplate } from "./templates/quotation-tag-mail-template";
import { QuotationId } from "@/types/quotations.types";
import { SessionUser } from "@/server-actions/auth-actions/auth.actions";
import { FullUser } from "@/types/user.types";

export const sendQuotationTagEmail = async ({
  message,
  quotationId,
  quotationIsVariant,
  taggingUser,
  taggedUser,
}: {
  quotationId: QuotationId;
  quotationIsVariant: boolean;
  taggingUser: SessionUser;
  taggedUser: FullUser;
  message: string | null;
}): Promise<boolean> => {
  try {
    const emailContent: string | null = quotationTagEmailTemplate({
      quotationId: quotationId,
      message: message,
      quotationIsVariant: quotationIsVariant,
      taggingUser: taggingUser,
      taggedUser: taggedUser,
    });

    if (!emailContent) throw Error("Quotation Tag Email content is null.");

    const emailData: SendEmailDto = {
      recipients: [
        {
          name: taggedUser.firstName,
          address: taggedUser.email,
        },
      ],
      sender: systemEmailSender,
      subject: `Quotation ${quotationId.quotationNumber} Tag`,
      message: emailContent,
      isHtml: true,
    };

    const sendEmailRes = await sendEmail(emailData);

    if (sendEmailRes.accepted.length < 1) {
      logger.error("Failed to send Quotation Tag Email:", sendEmailRes);
      return Promise.resolve(false);
    } else {
      logger.info("Quotation Tag Email Sent successfully");
      return Promise.resolve(true);
    }
  } catch (err) {
    logger.error(err);
    return Promise.resolve(false);
  }
};
