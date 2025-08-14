// src/services/tasks-service/tasks.service.ts

import { logger } from "@/logger/default-logger";
import prisma from "../../../db/db";
import { TasksRepository } from "./tasks.repository";
import { ItemRange } from "@/types/other.types";
import {
  fDateWwwDdMmmYyyy,
  getDaysInMonth,
  getMonthTimeRange,
} from "@/utils/time.utils";
import {
  NewRawSubTask,
  NewRawTask,
  TasksFetchResponse,
  TaskOut,
  TasksOutGroups,
  TaskUpdateData,
  SubTaskUpdateData,
  SubTaskOut,
} from "@/types/tasks.types";
import { ActionResponse } from "@/types/actions-response.types";
import { UserService } from "../user-service/user.service";
import {
  NOT_AUTHORIZED_RESPONSE,
  NOT_FOUND_RESPONSE,
} from "@/utils/constants.utils";
import { validateNewRawSubTask, validateNewRawTask } from "./task-methods";
import { SessionUser } from "@/server-actions/auth-actions/auth.actions";

export class TasksService {
  private readonly tasksRepo = new TasksRepository(prisma);

  constructor() {}

  recordNewUserTask = async (
    userId: number,
    newTask: NewRawTask,
    userSession: SessionUser
  ): Promise<ActionResponse<TaskOut>> => {
    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }

      if (
        userSession.userId !== userId ||
        userSession.userId !== newTask.userId
      ) {
        const res: ActionResponse = {
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        };

        return Promise.resolve(res);
      }

      if (!validateNewRawTask(newTask).valid) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }

      const { subTasks, time, ...taskRest } = newTask;

      const checkedSubTasks = this.formattedSubTasks(subTasks);

      const recordedTask = await this.tasksRepo.recordUserTask({
        ...taskRest,
        time: new Date().getTime(),
        subTasks: checkedSubTasks,
      });

      const res: ActionResponse<TaskOut> = {
        status: true,
        message: "Successful",
        data: recordedTask,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  recordNewUserSubTask = async (
    newSubTasks: NewRawSubTask[],
    userId: number,
    taskId: number,
    userSession: SessionUser
  ): Promise<ActionResponse<TaskOut>> => {
    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }

      if (userSession.userId !== userId) {
        const res: ActionResponse = {
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        };

        return Promise.resolve(res);
      }

      const checkedSubTasks = this.formattedSubTasks(newSubTasks);

      const recordedTask = await this.tasksRepo.recordUserSubTasks(
        checkedSubTasks,
        userId,
        taskId
      );

      if (!recordedTask) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }

      const res: ActionResponse<TaskOut> = {
        status: true,
        message: "Successful",
        data: recordedTask,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  // fetchThisMonthTasks = async (
  //   userId: number,
  //   usrTime: number
  // ): Promise<ActionResponse<TasksFetchResponse>> => {
  //   try {
  //     const user = await UserService.getUserById(userId);

  //     if (!user) {
  //       const res: ActionResponse = {
  //         status: false,
  //         message: NOT_FOUND_RESPONSE,
  //       };

  //       return Promise.resolve(res);
  //     }

  //     const timeRange: ItemRange = getMonthTimeRange(usrTime);

  //     const tasks: TaskOut[] = await this.tasksRepo.fetchUserTasks(
  //       userId,
  //       timeRange
  //     );

  //     const date = new Date(usrTime);
  //     const daysInMonth = getDaysInMonth(usrTime);
  //     const groupedTasks: TasksOutGroups = {};

  //     for (let day = 1; day <= daysInMonth; day++) {
  //       const dateStr = fDateWwwDdMmmYyyy(
  //         new Date(date.getFullYear(), date.getMonth(), day)
  //       );
  //       groupedTasks[dateStr] = [];
  //     }

  //     for (const task of tasks) {
  //       const dateStr = fDateWwwDdMmmYyyy(task.startTime);
  //       groupedTasks[dateStr].push(task);
  //     }

  //     const tasksRes: TasksFetchResponse = {
  //       user: user,
  //       details: { from: timeRange.min, to: timeRange.max },
  //       tasks: groupedTasks,
  //     };

  //     const res: ActionResponse<TasksFetchResponse> = {
  //       status: true,
  //       message: "Successful",
  //       data: tasksRes,
  //     };

  //     return Promise.resolve(res);
  //   } catch (err) {
  //     logger.error(err);
  //     return Promise.reject(err);
  //   }
  // };

  fetchThisMonthTasks = async (
    userId: number,
    usrTime: number
  ): Promise<ActionResponse<TasksFetchResponse>> => {
    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };
        return Promise.resolve(res);
      }

      const timeRange: ItemRange = getMonthTimeRange(usrTime);

      // Use fetchAllUsersTasks instead of fetchUserTasks
      const tasks: TaskOut[] = await this.tasksRepo.fetchAllUsersTasks(
        timeRange
      );

      const date = new Date(usrTime);
      const daysInMonth = getDaysInMonth(usrTime);
      const groupedTasks: TasksOutGroups = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = fDateWwwDdMmmYyyy(
          new Date(date.getFullYear(), date.getMonth(), day)
        );
        groupedTasks[dateStr] = [];
      }

      for (const task of tasks) {
        const dateStr = fDateWwwDdMmmYyyy(task.startTime);
        groupedTasks[dateStr].push(task);
      }

      const tasksRes: TasksFetchResponse = {
        user: user,
        details: { from: timeRange.min, to: timeRange.max },
        tasks: groupedTasks,
      };

      const res: ActionResponse<TasksFetchResponse> = {
        status: true,
        message: "Successful",
        data: tasksRes,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchSpecificPeriodTasks = async (
    userId: number,
    timeRange: ItemRange,
    userSession: SessionUser
  ): Promise<ActionResponse<TasksFetchResponse>> => {
    try {
      // If userId is 0, fetch all users' tasks (admin functionality)
      if (userId === 0) {
        const user = await UserService.getUserById(userSession.userId);
        
        if (!user) {
          const res: ActionResponse = {
            status: false,
            message: NOT_FOUND_RESPONSE,
          };
          return Promise.resolve(res);
        }

        // Fetch all users' tasks for the time range
        const tasks: TaskOut[] = await this.tasksRepo.fetchAllUsersTasks(
          timeRange
        );
        
        const groupedTasks: TasksOutGroups = {};
        const currentDate = new Date(timeRange.min);
        const endDate = new Date(timeRange.max);

        while (currentDate <= endDate) {
          const dateStr = fDateWwwDdMmmYyyy(currentDate);
          groupedTasks[dateStr] = [];
          currentDate.setDate(currentDate.getDate() + 1);
        }

        for (const task of tasks) {
          const dateStr = fDateWwwDdMmmYyyy(task.startTime);
          groupedTasks[dateStr].push(task);
        }

        const tasksRes: TasksFetchResponse = {
          user: user,
          details: { from: timeRange.min, to: timeRange.max },
          tasks: groupedTasks,
        };

        const res: ActionResponse<TasksFetchResponse> = {
          status: true,
          message: "Successful",
          data: tasksRes,
        };

        return Promise.resolve(res);
      }

      // Original logic for specific user tasks
      if (userId !== userSession.userId && userSession.role_id !== 1) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }
      const user = await UserService.getUserById(userId);

      if (!user) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }

      const tasks: TaskOut[] = await this.tasksRepo.fetchUserTasks(
        userId,
        timeRange
      );
      const groupedTasks: TasksOutGroups = {};

      const currentDate = new Date(timeRange.min);
      const endDate = new Date(timeRange.max);

      while (currentDate <= endDate) {
        const dateStr = fDateWwwDdMmmYyyy(currentDate);
        groupedTasks[dateStr] = [];
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (const task of tasks) {
        const dateStr = fDateWwwDdMmmYyyy(task.startTime);
        groupedTasks[dateStr].push(task);
      }

      const tasksRes: TasksFetchResponse = {
        user: user,
        details: { from: timeRange.min, to: timeRange.max },
        tasks: groupedTasks,
      };

      const res: ActionResponse<TasksFetchResponse> = {
        status: true,
        message: "Successful",
        data: tasksRes,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateUserTask = async (
    userId: number,
    taskUpdate: TaskUpdateData,
    userSession: SessionUser
  ): Promise<ActionResponse<TaskOut>> => {
    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }

      if (
        userSession.userId !== userId ||
        userSession.userId !== taskUpdate.userId
      ) {
        const res: ActionResponse = {
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        };

        return Promise.resolve(res);
      }

      const updatedTask: TaskOut | null = await this.tasksRepo.updateUserTask(
        taskUpdate
      );

      if (!updatedTask) {
        const res: ActionResponse = {
          status: false,
          message: "Either Task not found or No Data Provided",
        };

        return Promise.resolve(res);
      }

      const res: ActionResponse = {
        status: true,
        message: "Successful",
        data: updatedTask,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateUserSubTask = async (
    userId: number,
    subTaskUpdate: SubTaskUpdateData,
    userSession: SessionUser
  ): Promise<ActionResponse<TaskOut>> => {
    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }

      if (
        userSession.userId !== userId ||
        userSession.userId !== subTaskUpdate.userId
      ) {
        const res: ActionResponse = {
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        };

        return Promise.resolve(res);
      }

      const updatedSubTask: TaskOut | null =
        await this.tasksRepo.updateUserSubTask(subTaskUpdate);

      if (!updatedSubTask) {
        const res: ActionResponse = {
          status: false,
          message: "Either Sub Task not found or No Data Provided",
        };

        return Promise.resolve(res);
      }

      const res: ActionResponse = {
        status: true,
        message: "Successful",
        data: updatedSubTask,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteUserTask = async (
    userId: number,
    taskId: number,
    userSession: SessionUser
  ): Promise<ActionResponse<TaskOut>> => {
    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }

      if (userSession.userId !== userId) {
        const res: ActionResponse = {
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        };

        return Promise.resolve(res);
      }

      const deletedTask: TaskOut | null = await this.tasksRepo.deleteUserTask(
        userId,
        taskId
      );

      if (!deletedTask) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };
        return Promise.resolve(res);
      }

      const res: ActionResponse<TaskOut> = {
        status: true,
        message: "Successful",
        data: deletedTask,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteUserSubTask = async (
    userId: number,
    taskId: number,
    subTaskId: number,
    userSession: SessionUser
  ): Promise<ActionResponse<SubTaskOut>> => {
    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };

        return Promise.resolve(res);
      }

      if (userSession.userId !== userId) {
        const res: ActionResponse = {
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        };

        return Promise.resolve(res);
      }

      const updatedSubTask: SubTaskOut | null =
        await this.tasksRepo.deleteUserSubTask(userId, taskId, subTaskId);

      if (!updatedSubTask) {
        const res: ActionResponse = {
          status: false,
          message: NOT_FOUND_RESPONSE,
        };
        return Promise.resolve(res);
      }

      const res: ActionResponse<SubTaskOut> = {
        status: true,
        message: "Successful",
        data: updatedSubTask,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  lockExpiredTasks = async (): Promise<ActionResponse> => {
    try {
      const responseMessage = await this.tasksRepo.lockExpiredTasks();

      const res: ActionResponse = {
        status: true,
        message: responseMessage,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  private formattedSubTasks = (subTasks: NewRawSubTask[]): NewRawSubTask[] => {
    const checkSubTasks: NewRawSubTask[] = [];
    subTasks.forEach((subTask, index) => {
      if (validateNewRawSubTask(subTask).valid) {
        checkSubTasks.push(subTask);
      }
    });

    return checkSubTasks;
  };
}
