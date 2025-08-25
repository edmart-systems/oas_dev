// src/services/scheduler-service/jobs/tasks.jobs.ts

"use server";

import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import { TasksService } from "@/services/tasks-service/tasks.service";

export const pushPendingTasksJob = async (): Promise<ActionResponse> => {
  const jobName = `Push Pending Tasks Job`;
  const tasksService = new TasksService();

  try {
    logger.info(jobName + " Started");
    const res: ActionResponse = await tasksService.pushPendingTasks();
    logger.info(jobName + " Completed, " + res.message);
    return res;
  } catch (err) {
    logger.error(jobName + " Failed");
    logger.error(err);
    return { status: false, message: "Something went wrong" };
  }
};
