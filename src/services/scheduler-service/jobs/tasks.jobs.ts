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
