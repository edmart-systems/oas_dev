"use server";

import { QuotationsService } from "@/services/quotations-service/quotations.service";
import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";

export const quotationExpiryCheckJob = async () => {
  const jobName = "Quotation Expiry Check Job";
  const quotationsService = new QuotationsService();

  try {
    logger.info(jobName + " Started");

    const res: ActionResponse =
      await quotationsService.updateUnFlaggedExpiredQuotationsHandler();

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

export const quotationFollowupJob = async () => {
  const jobName = "Quotations Followup Job";
  const quotationsService = new QuotationsService();

  try {
    logger.info(jobName + " Started");

    const res: ActionResponse =
      await quotationsService.sendQuotationFollowupNotifications();

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
