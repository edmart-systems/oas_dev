 

import { Sub_task, Task as PrismaTask, Task_priority, Task_status } from "@prisma/client";
import { FullUser } from "./user.types";

export type TaskUser = {
  co_user_id: number;
  firstName: string;
  lastName: string;
  email: string;
  profile_picture?: string | null;
};

export type TaskStatus =
  | "Pending"
  | "In-Progress"
  | "Stalled"
  | "Failed"
  | "Done"
  | "Completed"
  | "Pushed"
  | "Cancelled";

export type TaskPriority = "Urgent" | "High" | "Moderate" | "Low";

export type NewRawSubTask = Pick<
  Sub_task,
  "taskName" | "taskDetails" | "comments"
> & {
  status: TaskStatus;
  startTime: number;
  endTime: number;
  time: number;
  priority?: TaskPriority;
};

export type NewRawTask = Pick<PrismaTask, "taskName" | "taskDetails" | "comments"> & {
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
  PrismaTask,
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
  deleted?: number;
};

export type SubTaskUpdateData = TaskUpdateData & {
  subTaskId: number;
};

export type FullRawSubTask = Sub_task & {
  taskStatus: Task_status;
  taskPriority: Task_priority | null;
};

export type FullRawTask = PrismaTask & {
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

// TaskManager specific types
export type SortDirection = "asc" | "desc";
export type SortField = "taskName" | "startTime" | "priority" | "status" | "user";

// API Response Interfaces
export interface ApiSubTask {
  subTaskId: number;
  taskId: number;
  statusId: number;
  priorityId?: number;
  taskName: string;
  taskDetails?: string;
  comments?: string;
  deleted: number;
  status: {
    id: number;
    status: TaskStatus;
  };
  startTime: number;
  endTime: number;
  time: number;
  priority?: {
    id: number;
    priority: TaskPriority;
  };
}

export interface ApiTask {
  taskId: number;
  userId: number;
  statusId: number;
  priorityId: number;
  taskName: string;
  taskDetails?: string;
  comments?: string;
  taskLocked: boolean;
  deleted: number;
  push_count: number;
  archived: number;
  archived_at?: string;
  status: {
    id: number;
    status: TaskStatus;
  };
  startTime: number;
  endTime: number;
  time: number;
  priority: {
    id: number;
    priority: TaskPriority;
  };
  subTasks: ApiSubTask[];
  user: {
    co_user_id: number;
    firstName: string;
    lastName: string;
    email: string;
    profile_picture?: string | null;
  };
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface TasksResponse {
  user: any;
  users?: Record<
    number,
    { co_user_id: number; firstName: string; lastName: string; email: string }
  >;
  details: {
    from: number;
    to: number;
  };
  tasks: Record<string, ApiTask[]>;
}

// Form Interfaces
export interface SubTask {
  id: string;
  apiSubTaskId?: number;
  taskName: string;
  taskDetails?: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: number;
  endTime: number;
  completed: boolean;
  deleted?: boolean;
}

export interface TaskItem {
  id: string;
  apiTaskId?: number;
  taskId?: number;
  userId: number;
  taskName: string;
  taskDetails?: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: number;
  endTime: number;
  time: number;
  subTasks: SubTask[];
  completed: boolean;
  deleted: boolean;
  push_count: number;
  archived: boolean;
  archived_at?: string;
  user?: {
    co_user_id: number;
    firstName: string;
    lastName: string;
    email: string;
    profile_picture?: string | null;
  };
}

export interface SubTaskForm {
  id: string;
  apiSubTaskId?: number;
  taskName: string;
  taskDetails?: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string;
  endTime: string;
  completed: boolean;
}

export interface TaskForm {
  taskName: string;
  taskDetails?: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string;
  endTime: string;
  subTasks: SubTaskForm[];
  completed: boolean;
}

export interface TaskManagerProps {
  userId: number;
  apiBaseUrl?: string;
}