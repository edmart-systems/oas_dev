// src/services/schedule-service/scheduler.ts

"use server";
import schedule from "node-schedule";
import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import {
  quotationExpiryCheckJob,
  quotationFollowupJob,
} from "./jobs/quotation.jobs";
import { deleteOldNotificationsJob } from "./jobs/notifications.jobs";
import { LOCAL_TIMEZONE } from "@/utils/constants.utils";
import { pushPendingTasksJob } from "./jobs/tasks.jobs";

let schedulerStarted = false;

const startScheduler = () => {
  if (schedulerStarted) {
    logger.info("Scheduler already running, skipping duplicate start");
    return;
  }
  
  schedulerStarted = true;
  logger.info("Scheduler instantiated!");
  console.log("Scheduler starting at:", new Date().toISOString());
  console.log("LOCAL_TIMEZONE:", LOCAL_TIMEZONE);





  const recurring_7_10_13_16_19_Rule = new schedule.RecurrenceRule();
  recurring_7_10_13_16_19_Rule.hour = [7, 10, 13, 16, 19];
  recurring_7_10_13_16_19_Rule.minute = 0;
  recurring_7_10_13_16_19_Rule.second = 0;
  recurring_7_10_13_16_19_Rule.tz = LOCAL_TIMEZONE;

  const recurring_7_10_13_16_19_Jobs = schedule.scheduleJob(
    recurring_7_10_13_16_19_Rule,
    async () => {
      const jobsName = "Recurring_7_10_13_16_19_Jobs";
      try {
        logger.info(jobsName + " Started");
        const quotationExpiryRes: ActionResponse =
          await quotationExpiryCheckJob();

        //Add other jobs above this line
        const completionMessage =
          jobsName +
          " Completed" +
          `Quotation Expiry Check: ${String(quotationExpiryRes.status)}: ${
            quotationExpiryRes.message
          }`;
        logger.info(completionMessage);
      } catch (err) {
        logger.info(jobsName + " Failed");
        logger.error(err);
      }
    }
  );

  const recurring_6_12_18_0_Rule = new schedule.RecurrenceRule();
  recurring_6_12_18_0_Rule.hour = [6, 12, 18, 0];
  recurring_6_12_18_0_Rule.minute = 0;
  recurring_6_12_18_0_Rule.second = 0;
  recurring_6_12_18_0_Rule.tz = LOCAL_TIMEZONE;

  const recurring_6_12_18_0_Jobs = schedule.scheduleJob(
    recurring_6_12_18_0_Rule,
    async () => {
      const jobsName = "Recurring_6_12_18_0_Jobs";
      try {
        logger.info(jobsName + " Started");

        const quotationExpiryRes = await quotationFollowupJob();

        //Add other jobs above this line
        const completionMessage =
          jobsName +
          " Completed" +
          `Quotations Followup: ${String(quotationExpiryRes.status)}: ${
            quotationExpiryRes.message
          }`;
        logger.info(completionMessage);
      } catch (err) {
        logger.info(jobsName + " Failed");
        logger.error(err);
      }
    }
  );

  const dailyMidnightRule = new schedule.RecurrenceRule();
  dailyMidnightRule.hour = 0;
  dailyMidnightRule.minute = 0;
  dailyMidnightRule.second = 0;
  dailyMidnightRule.tz = LOCAL_TIMEZONE;

  const dailyMidnightJobs = schedule.scheduleJob(
    dailyMidnightRule,
    async () => {
      const jobsName = "Daily Midnight Jobs";
      try {
        logger.info(jobsName + " Started");

        const quotationExpiryRes: ActionResponse =
          await deleteOldNotificationsJob();

        //Add other jobs above this line
        const completionMessage =
          jobsName +
          " Completed" +
          `Delete Old Notifications: ${String(quotationExpiryRes.status)}: ${
            quotationExpiryRes.message
          }`;
        logger.info(completionMessage);
      } catch (err) {
        logger.info(jobsName + " Failed");
        logger.error(err);
      }
    }
  );



  const dailyTaskProcessingRule = new schedule.RecurrenceRule();
  dailyTaskProcessingRule.hour = 0; 
  dailyTaskProcessingRule.minute = 0;
  dailyTaskProcessingRule.second = 0;
  dailyTaskProcessingRule.tz = LOCAL_TIMEZONE;

  const dailyTaskProcessingJobs = schedule.scheduleJob(dailyTaskProcessingRule, async () => {
    const jobsName = "Daily Task Processing - Push Pending Tasks";
    try {
      logger.info(jobsName + " Started");
      const pushPendingRes: ActionResponse = await pushPendingTasksJob();
      logger.info(jobsName + " Completed: " + pushPendingRes.message);
    } catch (err) {
      logger.info(jobsName + " Failed");
      logger.error(err);
    }
  });

  logger.info("Scheduler jobs configured:");
  logger.info("- Daily 00:00: Delete old notifications");
  logger.info("- Test 13:50: Process tasks (expire + push) (TESTING)");
  logger.info("- Multiple times daily: Quotation jobs");
  // const firstDayOfMonthJobs = schedule.scheduleJob("0 0 0 1 * *", () => {});
  // const firstJanYearlyJobs = schedule.scheduleJob("0 0 0 1 1 *", () => {});
  // const everyMondayJobs = schedule.scheduleJob("0 0 0 * * 1", () => {});

  /*
        *    *    *    *    *    *
        ┬    ┬    ┬    ┬    ┬    ┬
        │    │    │    │    │    │
        │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
        │    │    │    │    └───── month (1 - 12)
        │    │    │    └────────── day of month (1 - 31)
        │    │    └─────────────── hour (0 - 23)
        │    └──────────────────── minute (0 - 59)
        └───────────────────────── second (0 - 59, OPTIONAL)
*/
};

export default startScheduler;
