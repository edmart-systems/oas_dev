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
      const tasks = await this.prisma.task.findMany({
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
          subTasks: { 
            include: { taskStatus: true, taskPriority: true } 
          },
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

          const subTasksArr: Prisma.Sub_taskCreateManyInput[] = [];

          if (subTasks.length > 0) {
            for (let i = 0; i < subTasks.length; i++) {
              try {
                const {
                  startTime: subTaskStartTime,
                  endTime: subTaskEndTime,
                  time: subTaskTime,
                  priority: subTaskPriorityStr,
                  status: subTaskStatusStr,
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
                  taskName: restNewSubTask.taskName,
                  taskDetails: restNewSubTask.taskDetails,
                  comments: restNewSubTask.comments,
                  startTime: BigInt(subTaskStartTime),
                  endTime: BigInt(subTaskEndTime),
                  time: task.time,
                  statusId: subTaskStatus.id,
                  priorityId: subTaskPriority
                    ? subTaskPriority.id
                    : task.priorityId,
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

      const subTasksArr: Prisma.Sub_taskCreateManyInput[] = [];

      for (let i = 0; i < newSubTasks.length; i++) {
        try {
          const {
            startTime: subTaskStartTime,
            endTime: subTaskEndTime,
            time: subTaskTime,
            priority: subTaskPriorityStr,
            status: subTaskStatusStr,
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
            taskId: taskId,
            taskName: restNewSubTask.taskName,
            taskDetails: restNewSubTask.taskDetails,
            comments: restNewSubTask.comments,
            startTime: BigInt(subTaskStartTime),
            endTime: BigInt(subTaskEndTime),
            time: BigInt(timeNow),
            statusId: subTaskStatus.id,
            priorityId: subTaskPriority
              ? subTaskPriority.id
              : originalTask.priorityId,
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
      const deletedTask = await this.prisma.task.update({
        where: { taskId, userId, taskLocked: 0, deleted: 0 },
        data: { deleted: 1 },
        include: {
          taskStatus: true,
          taskPriority: true,
          subTasks: { include: { taskStatus: true, taskPriority: true } },
        },
      });

      await this.prisma.sub_task.updateMany({
        where: { taskId },
        data: { deleted: 1 }
      });

      return this.formatTasksOut(deletedTask)[0];
    } catch (err) {
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
      const deletedSubTask = await this.prisma.sub_task.update({
        where: {
          subTaskId: subTaskId,
          taskId: taskId,
          parentTask: { userId: userId, taskLocked: 0 },
        },
        data: { deleted: 1 },
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

  // lockExpiredTasks = async (): Promise<string> => {
  //   try {
  //     const now = Date.now();
  //     const today = new Date();
  //     today.setHours(9, 0, 0, 0);
  //     const todayEnd = new Date(today);
  //     todayEnd.setHours(18, 0, 0, 0);
      
  //     const [failedStatus, pendingStatus] = await Promise.all([
  //       this.prisma.task_status.findFirst({ where: { status: "Failed" } }),
  //       this.prisma.task_status.findFirst({ where: { status: "Pending" } })
  //     ]);
      
  //     if (!failedStatus || !pendingStatus) {
  //       return Promise.resolve("Required statuses not found in database.");
  //     }

  //     const expiredTasks = await this.prisma.task.findMany({
  //       where: {
  //         endTime: { lt: BigInt(now) },
  //         taskStatus: {
  //           status: { in: ["Pending", "In-Progress"] }
  //         }
  //       },
  //       include: { subTasks: true }
  //     });

  //     let processedCount = 0;
      
  //     for (const task of expiredTasks) {
  //       await this.prisma.$transaction(async (txn) => {
  //         // Mark original task as Failed and lock it
  //         await txn.task.update({
  //           where: { taskId: task.taskId },
  //           data: { 
  //             statusId: failedStatus.id,
  //             taskLocked: 1
  //           }
  //         });

  //         // Extract base task name (remove (x1), (x2), etc.)
  //         const baseTaskName = task.taskName.replace(/\s*\(x\d+\)\s*$/, '').trim();
          
  //         // Find the highest push_count for this base task name and user
  //         const maxPushCountTask = await txn.task.findFirst({
  //           where: {
  //             userId: task.userId,
  //             taskName: {
  //               startsWith: baseTaskName
  //             }
  //           },
  //           orderBy: {
  //             push_count: 'desc'
  //           }
  //         });

  //         const nextPushCount = (maxPushCountTask?.push_count || 0) + 1;

  //         // Create new task for today with incremented push_count
  //         const newTask = await txn.task.create({
  //           data: {
  //             userId: task.userId,
  //             taskName: baseTaskName,
  //             taskDetails: task.taskDetails,
  //             comments: task.comments,
  //             statusId: pendingStatus.id,
  //             priorityId: task.priorityId,
  //             startTime: BigInt(today.getTime()),
  //             endTime: BigInt(todayEnd.getTime()),
  //             time: BigInt(Date.now()),
  //             push_count: nextPushCount
  //           }
  //         });

  //         if (task.subTasks.length > 0) {
  //           const newSubTasks = task.subTasks.map(st => ({
  //             taskId: newTask.taskId,
  //             taskName: st.taskName,
  //             taskDetails: st.taskDetails,
  //             comments: st.comments,
  //             statusId: pendingStatus.id,
  //             priorityId: st.priorityId,
  //             startTime: BigInt(today.getTime()),
  //             endTime: BigInt(todayEnd.getTime()),
  //             time: BigInt(Date.now())
  //           }));
            
  //           await txn.sub_task.createMany({
  //             data: newSubTasks
  //           });
  //         }
  //       });
        
  //       processedCount++;
  //     }

  //     return Promise.resolve(`${processedCount} expired tasks marked as Failed and pushed to current tasks.`);
  //   } catch (err) {
  //     logger.error(err);
  //     return Promise.reject(err);
  //   }
  // };

  lockExpiredTasks = async (): Promise<string> => {
  try {
    const now = Date.now();
    logger.info(`Lock expired tasks - Current time: ${now}`);

    const failedStatus = await this.prisma.task_status.findFirst({
      where: { status: "Failed" }
    });

    if (!failedStatus) {
      return Promise.resolve("Failed status not found in database.");
    }

    const expiredTasks = await this.prisma.task.findMany({
      where: {
        endTime: { lt: BigInt(now) },
        taskStatus: {
          status: { in: ["Pending", "In-Progress"] }
        },
        deleted: 0,
        taskLocked: 0
      },
      include: { taskStatus: true }
    });

    logger.info(`Found ${expiredTasks.length} expired tasks to mark as failed`);
    expiredTasks.forEach(task => {
      logger.info(`Expired task: ${task.taskName}, End: ${Number(task.endTime)}, Status: ${task.taskStatus.status}`);
    });

    let processedCount = 0;

    for (const task of expiredTasks) {
      await this.prisma.task.update({
        where: { taskId: task.taskId },
        data: { 
          statusId: failedStatus.id,
          taskLocked: 1
        }
      });
      processedCount++;
    }

    return Promise.resolve(`${processedCount} expired tasks marked as Failed.`);
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
};


  pushPendingTasks = async (): Promise<string> => {
    try {
      const now = new Date();
      const currentTime = now.getTime();
      
      const today = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Kampala"}));
      today.setHours(8, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      
      logger.info(`Push pending tasks - Now: ${currentTime}, Today start: ${todayStart.getTime()}`);
      
      const [failedStatus, pushedStatus] = await Promise.all([
        this.prisma.task_status.findFirst({ where: { status: "Failed" } }),
        this.prisma.task_status.findFirst({ where: { status: "Pushed" } })
      ]);
      
      if (!failedStatus) {
        return Promise.resolve("Failed status not found in database.");
      }
      
      const tasksToPush = await this.prisma.task.findMany({
        where: {
          taskStatus: {
            status: { in: ["Pending", "In-Progress", "Pushed"] }
          },
          startTime: { lte: BigInt(todayEnd.getTime()) }, // Only tasks scheduled for today or before
          deleted: 0,
          taskLocked: 0
        },
        include: { subTasks: true, taskStatus: true }
      });
      
      logger.info(`Found ${tasksToPush.length} tasks to process`);
      
      if (tasksToPush.length === 0) {
        return Promise.resolve("0 tasks processed.");
      }
      
      let expiredCount = 0;
      let pushedCount = 0;
      
      for (const task of tasksToPush) {
        const isExpired = Number(task.endTime) < currentTime;
        
        if (isExpired) {
          // Mark as Failed and lock
          await this.prisma.task.update({
            where: { taskId: task.taskId },
            data: {
              statusId: failedStatus.id,
              taskLocked: 1
            }
          });
          expiredCount++;
          logger.info(`Expired task marked as Failed: ${task.taskName}`);
        } else {
          // Push to today with Pushed status
          const nextPushCount = (task.push_count || 0) + 1;
          
          await this.prisma.$transaction(async (txn) => {
            await txn.task.update({
              where: { taskId: task.taskId },
              data: {
                push_count: nextPushCount,
                startTime: BigInt(today.getTime()),
                time: BigInt(currentTime),
                statusId: pushedStatus?.id || task.statusId
              }
            });

            if (task.subTasks.length > 0) {
              await txn.sub_task.updateMany({
                where: { taskId: task.taskId },
                data: {
                  startTime: BigInt(today.getTime()),
                  time: BigInt(currentTime),
                  statusId: pushedStatus?.id
                }
              });
            }
          });
          pushedCount++;
          logger.info(`Task pushed with Pushed status: ${task.taskName}`);
        }
      }

      return Promise.resolve(`${expiredCount} tasks marked as Failed, ${pushedCount} tasks pushed with Pushed status.`);
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

      if (taskData.deleted !== undefined && Number(originalTask.deleted) !== taskData.deleted) {
        finalTaskUpdateData.deleted = taskData.deleted;
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
        co_user_id: typeof task.user.co_user_id === 'string' ? parseInt(task.user.co_user_id) : task.user.co_user_id,
        firstName: task.user.firstName,
        lastName: task.user.lastName,
        email: task.user.email,
        profile_picture: task.user.profile_picture,
      } : undefined,
    };
  });

  return formattedTasks;
};



  
fetchAllUsersTasks = async (timeRange: ItemRange): Promise<TaskOut[]> => {
  try {
    const tasks = await this.prisma.task.findMany({
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
        subTasks: { 
          include: { taskStatus: true, taskPriority: true } 
        },
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

getTaskById = async (taskId: number, userId: number): Promise<TaskOut | null> => {
  try {
    const task = await this.prisma.task.findFirst({
      where: { taskId, userId },
      include: {
        taskStatus: true,
        taskPriority: true,
        subTasks: { 
          where: { deleted: 0 },
          include: { taskStatus: true, taskPriority: true } 
        },
      },
    });

    if (!task) return null;

    const formattedTask = this.formatTasksOut(task);
    return formattedTask[0];
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
};

handleManualTaskFailure = async (taskId: number, userId: number): Promise<void> => {
  try {
    const task = await this.prisma.task.findFirst({
      where: { taskId, userId },
      include: { subTasks: true }
    });

    if (!task) return;

    const [failedStatus, pendingStatus] = await Promise.all([
      this.prisma.task_status.findFirst({ where: { status: "Failed" } }),
      this.prisma.task_status.findFirst({ where: { status: "Pending" } })
    ]);
    
    if (!failedStatus || !pendingStatus) return;

    await this.prisma.$transaction(async (txn) => {
      // Extract base task name (remove (x1), (x2), etc.)
      const baseTaskName = task.taskName.replace(/\s*\(x\d+\)\s*$/, '').trim();
      
      // Find the highest push_count for this base task name and user
      const maxPushCountTask = await txn.task.findFirst({
        where: {
          userId: task.userId,
          taskName: {
            startsWith: baseTaskName
          }
        },
        orderBy: {
          push_count: 'desc'
        }
      });

      const nextPushCount = (maxPushCountTask?.push_count || 0) + 1;

      // Create new task for today with incremented push_count
      const now = Date.now();
      const utcTime = now + (new Date().getTimezoneOffset() * 60 * 1000);
      const ugandaTime = utcTime + (3 * 60 * 60 * 1000);
      const ugandaToday = new Date(ugandaTime);
      
      const today = new Date(ugandaToday);
      today.setHours(9, 0, 0, 0);
      const todayEnd = new Date(ugandaToday);
      todayEnd.setHours(18, 0, 0, 0);

      const newTask = await txn.task.create({
        data: {
          userId: task.userId,
          taskName: baseTaskName,
          taskDetails: task.taskDetails,
          comments: task.comments,
          statusId: pendingStatus.id,
          priorityId: task.priorityId,
          startTime: BigInt(today.getTime()),
          endTime: BigInt(todayEnd.getTime()),
          time: BigInt(Date.now()),
          push_count: nextPushCount
        }
      });

      if (task.subTasks.length > 0) {
        const newSubTasks = task.subTasks.map(st => ({
          taskId: newTask.taskId,
          taskName: st.taskName,
          taskDetails: st.taskDetails,
          comments: st.comments,
          statusId: pendingStatus.id,
          priorityId: st.priorityId,
          startTime: BigInt(today.getTime()),
          endTime: BigInt(todayEnd.getTime()),
          time: BigInt(Date.now())
        }));
        
        await txn.sub_task.createMany({
          data: newSubTasks
        });
      }
    });
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
};

restoreUserTask = async (
    userId: number,
    taskId: number
  ): Promise<TaskOut | null> => {
    try {
      const restoredTask = await this.prisma.task.update({
        where: { taskId, userId, deleted: 1 },
        data: { deleted: 0 },
        include: {
          taskStatus: true,
          taskPriority: true,
          subTasks: { include: { taskStatus: true, taskPriority: true } },
        },
      });

      await this.prisma.sub_task.updateMany({
        where: { taskId },
        data: { deleted: 0 }
      });

      return this.formatTasksOut(restoredTask)[0];
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };



}
