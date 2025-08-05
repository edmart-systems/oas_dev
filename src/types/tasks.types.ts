// src/types/tasks.types.ts

import { Sub_task, Task, Task_priority, Task_status } from "@prisma/client";
import { FullUser } from "./user.types";

export type TaskUser = {
  co_user_id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type TaskStatus =
  | "Pending"
  | "In-Progress"
  | "Stalled"
  | "Failed"
  | "Done"
  | "Completed";

export type TaskPriority = "Urgent" | "High" | "Moderate" | "Low";

export type NewRawSubTask = Pick<
  Sub_task,
  "taskName" | "taskDetails" | "comments" | "taskId"
> & {
  userId: number;
  status: TaskStatus;
  startTime: number;
  endTime: number;
  time: number;
  priority?: TaskPriority;
};

export type NewRawTask = Pick<Task, "taskName" | "taskDetails" | "comments"> & {
  userId: number;
  status: TaskStatus;
  startTime: number;
  endTime: number;
  time: number;
  priority: TaskPriority;
  subTasks: NewRawSubTask[];
};

export type SubTaskOut = Omit<
  Sub_task,
  "time" | "startTime" | "endTime" | "updated_at" | "created_at"
> & {
  status: Task_status;
  startTime: number;
  endTime: number;
  time: number;
  priority?: Task_priority | null;
};

export type TaskOut = Omit<
  Task,
  "time" | "startTime" | "endTime" | "taskLocked" | "updated_at" | "created_at"
> & {
  taskLocked: boolean;
  status: Task_status;
  startTime: number;
  endTime: number;
  time: number;
  priority: Task_priority;
  subTasks: SubTaskOut[];
  user?: TaskUser;
};

export type TaskUpdateData = {
  userId: number;
  taskId: number;
  statusStr?: TaskStatus;
  priorityStr?: TaskPriority;
  taskName?: string;
  taskDetails?: string;
  comments?: string;
  startTime?: number;
  endTime?: number;
};

export type SubTaskUpdateData = TaskUpdateData & {
  subTaskId: number;
};

export type FullRawSubTask = Sub_task & {
  taskStatus: Task_status;
  taskPriority: Task_priority | null;
};

export type FullRawTask = Task & {
  taskStatus: Task_status;
  taskPriority: Task_priority;
  subTasks: FullRawSubTask[];
   user?: TaskUser;
};

export type TasksOutGroups = {
  [date: string]: TaskOut[];
};

export type TasksFetchResponse = {
  user: FullUser;
  details: {
    from: number;
    to: number;
  };
  tasks: TasksOutGroups;
};

export interface ActionResponse<T = any> {
  status: boolean
  message: string
  data?: T
}