// src/services/tasks-service/tasks.repository.ts

import { logger } from "@/logger/default-logger";
import { ItemRange } from "@/types/other.types";
import {
  FullRawSubTask,
  FullRawTask,
  NewRawSubTask,
  NewRawTask,
  SubTaskOut,
  SubTaskUpdateData,
  TaskOut,
  TaskUpdateData,
} from "@/types/tasks.types";
import { MAX_TASK_EXPIRY_DAYS } from "@/utils/constants.utils";
import { daysToMilliseconds } from "@/utils/time-converters.utils";
import { Prisma, PrismaClient, Sub_task, Task } from "@prisma/client";

export class TasksRepository {
  constructor(private readonly prisma: PrismaClient) {}

  fetchUserTasks = async (
    userId: number,
    timeRange: ItemRange
  ): Promise<TaskOut[]> => {
    try {
      const tasks: FullRawTask[] = await this.prisma.task.findMany({
        where: {
          userId: userId,
          startTime: {
            gte: BigInt(timeRange.min),
            lte: BigInt(timeRange.max),
          },
        },
        include: {
          taskStatus: true,
          taskPriority: true,
          subTasks: { include: { taskStatus: true, taskPriority: true } },
        },
        orderBy: {
          startTime: "desc",
        },
      });

      const formattedTasks: TaskOut[] = this.formatTasksOut(tasks);

      return Promise.resolve(formattedTasks);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  recordUserTask = async (newTask: NewRawTask): Promise<TaskOut> => {
    try {
      const {
        startTime,
        endTime,
        time,
        priority: priorityStr,
        status: statusStr,
        subTasks,
        ...restNewTask
      } = newTask;

      const recordedTask = await this.prisma.$transaction(
        async (txn): Promise<TaskOut> => {
          const statuses = await this.prisma.task_status.findMany();
          const priorities = await this.prisma.task_priority.findMany();

          const status = statuses.find((item) => item.status === statusStr);

          if (!status) {
            throw new Error("Invalid sub task status");
          }

          const priority = priorities.find(
            (item) => item.priority === priorityStr
          );

          if (!priority) {
            throw new Error("Invalid sub task status");
          }

          const task = await txn.task.create({
            data: {
              startTime: BigInt(startTime),
              endTime: BigInt(endTime),
              time: BigInt(time),
              statusId: status.id,
              priorityId: priority.id,
              ...restNewTask,
            },
          });

          const subTasksArr: Omit<
            Sub_task,
            "subTaskId" | "updated_at" | "created_at"
          >[] = [];

          if (subTasks.length > 0) {
            for (let i = 0; i < subTasks.length; i++) {
              try {
                const {
                  startTime: subTaskStartTime,
                  endTime: subTaskEndTime,
                  time: subTaskTime,
                  priority: subTaskPriorityStr,
                  status: subTaskStatusStr,
                  userId,
                  taskId,
                  ...restNewSubTask
                } = subTasks[i];

                const subTaskStatus = statuses.find(
                  (item) => item.status === subTaskStatusStr
                );

                if (!subTaskStatus) {
                  throw new Error("Invalid sub task status");
                }

                const subTaskPriority = priorities.find(
                  (item) => item.priority === subTaskPriorityStr
                );

                subTasksArr.push({
                  taskId: task.taskId,
                  startTime: BigInt(subTaskStartTime),
                  endTime: BigInt(subTaskEndTime),
                  time: task.time,
                  statusId: subTaskStatus.id,
                  priorityId: subTaskPriority
                    ? subTaskPriority.id
                    : task.priorityId,
                  ...restNewSubTask,
                });
              } catch (err) {
                logger.error(err);
                continue;
              }
            }
          }

          subTasksArr.length > 0 &&
            (await txn.sub_task.createMany({
              data: subTasksArr,
              skipDuplicates: true,
            }));

          const updatedTask = await txn.task.findUniqueOrThrow({
            where: {
              taskId: task.taskId,
            },
            include: {
              taskStatus: true,
              taskPriority: true,
              subTasks: { include: { taskStatus: true, taskPriority: true } },
            },
          });

          const formattedTask = this.formatTasksOut(updatedTask);
          return formattedTask[0];
        }
      );

      return Promise.resolve(recordedTask);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  recordUserSubTasks = async (
    newSubTasks: NewRawSubTask[],
    userId: number,
    taskId: number
  ): Promise<TaskOut | null> => {
    try {
      const timeNow = new Date().getTime();
      const originalTask = await this.prisma.task.findUniqueOrThrow({
        where: { taskId: taskId, userId: userId },
        include: { taskPriority: true, taskStatus: true },
      });

      const statuses = await this.prisma.task_status.findMany();
      const priorities = await this.prisma.task_priority.findMany();

      const subTasksArr: Omit<
        Sub_task,
        "subTaskId" | "updated_at" | "created_at"
      >[] = [];

      for (let i = 0; i < newSubTasks.length; i++) {
        try {
          if (
            newSubTasks[i].userId !== userId ||
            newSubTasks[i].taskId !== taskId
          ) {
            continue;
          }

          const {
            startTime: subTaskStartTime,
            endTime: subTaskEndTime,
            time: subTaskTime,
            priority: subTaskPriorityStr,
            status: subTaskStatusStr,
            userId: subtaskUserId,
            ...restNewSubTask
          } = newSubTasks[i];

          const subTaskStatus = statuses.find(
            (item) => item.status === subTaskStatusStr
          );

          if (!subTaskStatus) {
            throw new Error("Invalid sub task status");
          }

          const subTaskPriority = priorities.find(
            (item) => item.priority === subTaskPriorityStr
          );

          subTasksArr.push({
            startTime: BigInt(subTaskStartTime),
            endTime: BigInt(subTaskEndTime),
            time: BigInt(timeNow),
            statusId: subTaskStatus.id,
            priorityId: subTaskPriority
              ? subTaskPriority.id
              : originalTask.priorityId,
            ...restNewSubTask,
          });
        } catch (err) {
          logger.error(err);
          continue;
        }
      }

      subTasksArr.length > 0 &&
        (await this.prisma.sub_task.createMany({
          data: subTasksArr,
          skipDuplicates: true,
        }));

      const updatedTask = await this.prisma.task.findUniqueOrThrow({
        where: {
          taskId: originalTask.taskId,
        },
        include: {
          taskStatus: true,
          taskPriority: true,
          subTasks: { include: { taskStatus: true, taskPriority: true } },
        },
      });

      const formattedTask = this.formatTasksOut(updatedTask);
      return Promise.resolve(formattedTask[0]);
    } catch (err) {
      logger.error(err);
      return Promise.resolve(null);
    }
  };

  deleteUserTask = async (
    userId: number,
    taskId: number
  ): Promise<TaskOut | null> => {
    try {
      const deletedTask = await this.prisma.task.delete({
        where: { taskId: taskId, userId: userId, taskLocked: 0 },
        include: {
          taskStatus: true,
          taskPriority: true,
          subTasks: { include: { taskStatus: true, taskPriority: true } },
        },
      });

      const formattedDeletedTask = this.formatTasksOut(deletedTask);

      return Promise.resolve(formattedDeletedTask[0]);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        return Promise.resolve(null);
      }

      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteUserSubTask = async (
    userId: number,
    taskId: number,
    subTaskId: number
  ): Promise<SubTaskOut | null> => {
    try {
      const deletedSubTask = await this.prisma.sub_task.delete({
        where: {
          taskId: taskId,
          subTaskId: subTaskId,
          parentTask: { userId: userId, taskLocked: 0 },
        },
        include: { taskStatus: true, taskPriority: true },
      });

      const formattedDeletedSubTask = this.formatSubTasksOut(deletedSubTask);

      return Promise.resolve(formattedDeletedSubTask[0]);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        return Promise.resolve(null);
      }

      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateUserTask = async (
    taskData: TaskUpdateData
  ): Promise<TaskOut | null> => {
    try {
      const formattedTaskUpdateData = await this.taskUpdateDataGenerator(
        taskData
      );

      if (!formattedTaskUpdateData) {
        return Promise.resolve(null);
      }

      const updatedTask = await this.prisma.task.update({
        where: {
          userId: taskData.userId,
          taskId: taskData.taskId,
          taskLocked: 0,
        },
        data: formattedTaskUpdateData,
        include: {
          taskStatus: true,
          taskPriority: true,
          subTasks: { include: { taskStatus: true, taskPriority: true } },
        },
      });

      const formattedTasks: TaskOut[] = this.formatTasksOut(updatedTask);

      return Promise.resolve(formattedTasks[0]);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateUserSubTask = async (
    subTaskData: SubTaskUpdateData
  ): Promise<TaskOut | null> => {
    try {
      const formattedSubTaskUpdateData = await this.subTaskUpdateDataGenerator(
        subTaskData
      );

      if (!formattedSubTaskUpdateData) {
        return Promise.resolve(null);
      }

      const updatedSubTask = await this.prisma.sub_task.update({
        where: {
          subTaskId: subTaskData.subTaskId,
          taskId: subTaskData.taskId,
          parentTask: { userId: subTaskData.userId, taskLocked: 0 },
        },
        data: formattedSubTaskUpdateData,
      });

      const updatedTask = await this.prisma.task.findUniqueOrThrow({
        where: {
          userId: subTaskData.userId,
          taskId: subTaskData.taskId,
        },
        include: {
          taskStatus: true,
          taskPriority: true,
          subTasks: { include: { taskStatus: true, taskPriority: true } },
        },
      });

      const formattedTasks: TaskOut[] = this.formatTasksOut(updatedTask);

      return Promise.resolve(formattedTasks[0]);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  lockExpiredTasks = async (): Promise<string> => {
    try {
      const expiryThreshold =
        Date.now() - daysToMilliseconds(MAX_TASK_EXPIRY_DAYS);

      const lockedRecords = await this.prisma.task.updateMany({
        where: {
          taskLocked: 0,
          time: { lte: BigInt(expiryThreshold) },
        },
        data: {
          taskLocked: 1,
        },
      });

      return Promise.resolve(`${lockedRecords.count} expired tasks locked.`);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  private taskUpdateDataGenerator = async (
    taskData: TaskUpdateData
  ): Promise<Prisma.XOR<
    Prisma.TaskUpdateInput,
    Prisma.TaskUncheckedUpdateInput
  > | null> => {
    try {
      const originalTask = await this.prisma.task.findUniqueOrThrow({
        where: { taskId: taskData.taskId, userId: taskData.userId },
        include: { taskPriority: true, taskStatus: true },
      });

      if (Boolean(originalTask.taskLocked)) {
        return Promise.resolve(null);
      }

      const finalTaskUpdateData: Prisma.XOR<
        Prisma.TaskUpdateInput,
        Prisma.TaskUncheckedUpdateInput
      > = {};

      if (taskData.taskName && originalTask.taskName !== taskData.taskName) {
        finalTaskUpdateData.taskName = taskData.taskName;
      }

      if (
        taskData.taskDetails &&
        originalTask.taskDetails !== taskData.taskDetails
      ) {
        finalTaskUpdateData.taskDetails = taskData.taskDetails;
      }

      if (taskData.comments && originalTask.comments !== taskData.comments) {
        finalTaskUpdateData.comments = taskData.comments;
      }

      if (
        taskData.startTime &&
        Number(originalTask.startTime) !== taskData.startTime
      ) {
        finalTaskUpdateData.startTime = BigInt(taskData.startTime);
      }

      if (
        taskData.endTime &&
        Number(originalTask.endTime) !== taskData.endTime
      ) {
        finalTaskUpdateData.endTime = BigInt(taskData.endTime);
      }

      if (
        taskData.statusStr &&
        originalTask.taskStatus.status !== taskData.statusStr
      ) {
        const status = await this.prisma.task_status.findFirst({
          where: { status: taskData.statusStr },
        });

        finalTaskUpdateData.statusId = status ? status.id : undefined;
      }

      if (
        taskData.priorityStr &&
        originalTask.taskPriority.priority !== taskData.priorityStr
      ) {
        const priority = await this.prisma.task_priority.findFirst({
          where: { priority: taskData.priorityStr },
        });

        finalTaskUpdateData.priorityId = priority ? priority.id : undefined;
      }

      if (Object.keys(finalTaskUpdateData).length < 1) {
        return Promise.resolve(null);
      }

      return Promise.resolve(finalTaskUpdateData);
    } catch (err) {
      return Promise.resolve(null);
    }
  };

  private subTaskUpdateDataGenerator = async (
    subTaskData: SubTaskUpdateData
  ): Promise<Prisma.XOR<
    Prisma.Sub_taskUpdateInput,
    Prisma.Sub_taskUncheckedUpdateInput
  > | null> => {
    try {
      const originalTask = await this.prisma.task.findUniqueOrThrow({
        where: { taskId: subTaskData.taskId, userId: subTaskData.userId },
        include: {
          subTasks: {
            where: { subTaskId: subTaskData.subTaskId },
            include: { taskPriority: true, taskStatus: true },
          },
        },
      });

      const originalSubTask = originalTask.subTasks[0];

      if (!originalSubTask) {
        return Promise.resolve(null);
      }

      if (Boolean(originalTask.taskLocked)) {
        return Promise.resolve(null);
      }

      const finalSubTaskUpdateData: Prisma.XOR<
        Prisma.Sub_taskUpdateInput,
        Prisma.Sub_taskUncheckedUpdateInput
      > = {};

      if (
        subTaskData.taskName &&
        originalSubTask.taskName !== subTaskData.taskName
      ) {
        finalSubTaskUpdateData.taskName = subTaskData.taskName;
      }

      if (
        subTaskData.taskDetails &&
        originalSubTask.taskDetails !== subTaskData.taskDetails
      ) {
        finalSubTaskUpdateData.taskDetails = subTaskData.taskDetails;
      }

      if (
        subTaskData.comments &&
        originalSubTask.comments !== subTaskData.comments
      ) {
        finalSubTaskUpdateData.comments = subTaskData.comments;
      }

      if (
        subTaskData.startTime &&
        Number(originalSubTask.startTime) !== subTaskData.startTime
      ) {
        finalSubTaskUpdateData.startTime = BigInt(subTaskData.startTime);
      }

      if (
        subTaskData.endTime &&
        Number(originalSubTask.endTime) !== subTaskData.endTime
      ) {
        finalSubTaskUpdateData.endTime = BigInt(subTaskData.endTime);
      }

      if (
        subTaskData.statusStr &&
        originalSubTask.taskStatus.status !== subTaskData.statusStr
      ) {
        const status = await this.prisma.task_status.findFirst({
          where: { status: subTaskData.statusStr },
        });

        finalSubTaskUpdateData.statusId = status ? status.id : undefined;
      }

      if (
        subTaskData.priorityStr &&
        originalSubTask.taskPriority?.priority !== subTaskData.priorityStr
      ) {
        const priority = await this.prisma.task_priority.findFirst({
          where: { priority: subTaskData.priorityStr },
        });

        finalSubTaskUpdateData.priorityId = priority ? priority.id : undefined;
      }

      if (Object.keys(finalSubTaskUpdateData).length < 1) {
        return Promise.resolve(null);
      }

      return Promise.resolve(finalSubTaskUpdateData);
    } catch (err) {
      return Promise.resolve(null);
    }
  };

  private formatSubTasksOut = (
    subTasks: FullRawSubTask | FullRawSubTask[]
  ): SubTaskOut[] => {
    const formattedSubTasks: SubTaskOut[] = (
      Array.isArray(subTasks) ? subTasks : Array(subTasks)
    ).map((subTask) => {
      const {
        updated_at,
        created_at,
        taskStatus,
        taskPriority,
        startTime,
        endTime,
        time,
        ...subTaskRest
      } = subTask;
      return {
        ...subTaskRest,
        status: taskStatus,
        startTime: Number(startTime),
        endTime: Number(endTime),
        time: Number(time),
        priority: taskPriority,
      };
    });

    return formattedSubTasks;
  };

// Update the formatTasksOut method in TasksRepository:
// private formatTasksOut = (tasks: FullRawTask | FullRawTask[]): TaskOut[] => {
//   const formattedTasks: TaskOut[] = (
//     Array.isArray(tasks) ? tasks : Array(tasks)
//   ).map((task) => {
//     const {
//       updated_at,
//       created_at,
//       taskStatus,
//       taskPriority,
//       taskLocked,
//       subTasks,
//       startTime,
//       endTime,
//       time,
//       user, 
//       ...taskRest
//     } = task;

//     const formattedSubTasks: SubTaskOut[] = this.formatSubTasksOut(subTasks);

//     return {
//       ...taskRest,
//       taskLocked: Boolean(taskLocked),
//       status: taskStatus,
//       startTime: Number(startTime),
//       endTime: Number(endTime),
//       time: Number(time),
//       priority: taskPriority,
//       subTasks: formattedSubTasks,
//       user: user ? { // Add user data to output
//         co_user_id: user.co_user_id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//       } : undefined,
//     };
//   });

//   return formattedTasks;
// };

private formatTasksOut = (tasks: any): TaskOut[] => {
  const formattedTasks: TaskOut[] = (
    Array.isArray(tasks) ? tasks : Array(tasks)
  ).map((task) => {
    const {
      updated_at,
      created_at,
      taskStatus,
      taskPriority,
      taskLocked,
      subTasks,
      startTime,
      endTime,
      time,
      ...taskRest
    } = task;

    const formattedSubTasks: SubTaskOut[] = this.formatSubTasksOut(subTasks);

    return {
      ...taskRest,
      taskLocked: Boolean(taskLocked),
      status: taskStatus,
      startTime: Number(startTime),
      endTime: Number(endTime),
      time: Number(time),
      priority: taskPriority,
      subTasks: formattedSubTasks,
      user: task.user ? {
        co_user_id: task.user.co_user_id,
        firstName: task.user.firstName,
        lastName: task.user.lastName,
        email: task.user.email,
      } : undefined,
    };
  });

  return formattedTasks;
};



  
fetchAllUsersTasks = async (timeRange: ItemRange): Promise<TaskOut[]> => {
  try {
    const tasks: FullRawTask[] = await this.prisma.task.findMany({
      where: {
        startTime: {
          gte: BigInt(timeRange.min),
          lte: BigInt(timeRange.max),
        },
      },
      include: {
        taskStatus: true,
        taskPriority: true,
        user: true, // Include user data
        subTasks: { include: { taskStatus: true, taskPriority: true } },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    const formattedTasks: TaskOut[] = this.formatTasksOut(tasks);
    return Promise.resolve(formattedTasks);
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
};

}
