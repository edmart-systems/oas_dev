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
import { lockOldTasksJob, pushTasksToCurrentDayJob } from "./jobs/tasks.jobs";

const startScheduler = () => {
  logger.info("Scheduler instantiated!");
  console.log("Scheduler starting at:", new Date().toISOString());
  console.log("LOCAL_TIMEZONE:", LOCAL_TIMEZONE);

  // Test job every 10 seconds
  const testJob = schedule.scheduleJob("*/10 * * * * *", () => {
    console.log("Test job running at:", new Date().toISOString());
    logger.info("Test job executed successfully");
  });

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

        const expiredTasksRes: ActionResponse = await lockOldTasksJob();

        //Add other jobs above this line
        const completionMessage =
          jobsName +
          " Completed" +
          `Delete Old Notifications: ${String(quotationExpiryRes.status)}: ${
            quotationExpiryRes.message
          }\nLock Old Tasks: ${expiredTasksRes.message}`;
        logger.info(completionMessage);
      } catch (err) {
        logger.info(jobsName + " Failed");
        logger.error(err);
      }
    }
  );



  const daily_00_10_Rule = new schedule.RecurrenceRule();
  daily_00_10_Rule.hour = 0;
  daily_00_10_Rule.minute = 10;
  daily_00_10_Rule.second = 0;
  daily_00_10_Rule.tz = LOCAL_TIMEZONE;

  const daily_00_10_Jobs = schedule.scheduleJob(daily_00_10_Rule, async () => {
    const jobsName = "Daily 00:10 Jobs";
    try {
      logger.info(jobsName + " Started");
      const pushTasksRes: ActionResponse = await pushTasksToCurrentDayJob();
      logger.info(jobsName + " Completed: " + pushTasksRes.message);
    } catch (err) {
      logger.info(jobsName + " Failed");
      logger.error(err);
    }
  });
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
