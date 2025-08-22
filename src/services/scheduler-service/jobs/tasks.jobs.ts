// src/services/scheduler-service/jobs/tasks.jobs.ts

"use server";

import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import { TasksService } from "@/services/tasks-service/tasks.service";

export const lockOldTasksJob = async (): Promise<ActionResponse> => {
  const jobName = `Lock Old Tasks Job`;
  const tasksService = new TasksService();

  try {
    logger.info(jobName + " Started");

    const res: ActionResponse = await tasksService.lockExpiredTasks();

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



export const pushTasksToCurrentDayJob = async (): Promise<ActionResponse> => {
  const jobName = `Push Tasks To Current Day Job`;
  const tasksService = new TasksService();

  try {
    logger.info(jobName + " Started");
    const res: ActionResponse = await tasksService.pushTasksToCurrentDay();
    logger.info(jobName + " Completed, " + res.message);
    return res;
  } catch (err) {
    logger.error(jobName + " Failed");
    logger.error(err);
    return { status: false, message: "Something went wrong" };
  }
};
