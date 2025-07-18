import { z as zod } from "zod";

export const TaskStatusDtoSchema = zod.enum([
  "Pending",
  "In-Progress",
  "Stalled",
  "Failed",
  "Done",
  "Completed",
]);

export const TaskPriorityDtoSchema = zod.enum([
  "Urgent",
  "High",
  "Moderate",
  "Low",
]);

export const NewSubTaskDtoSchema = zod.object({
  taskId: zod.number(),
  userId: zod.number(),
  taskName: zod.string(),
  taskDetails: zod.string(),
  comments: zod.string(),
  status: TaskStatusDtoSchema,
  startTime: zod.number(),
  endTime: zod.number(),
  time: zod.number(),
  priority: TaskPriorityDtoSchema.optional(),
});

export const NewTaskDtoSchema = zod.object({
  userId: zod.number(),
  taskName: zod.string(),
  taskDetails: zod.string(),
  comments: zod.string(),
  status: TaskStatusDtoSchema,
  startTime: zod.number(),
  endTime: zod.number(),
  time: zod.number(),
  priority: TaskPriorityDtoSchema,
  subTasks: zod.array(NewSubTaskDtoSchema),
});

export const TaskUpdateDataDtoSchema = zod.object({
  userId: zod.number(),
  taskId: zod.number(),
  statusStr: TaskStatusDtoSchema.optional(),
  priorityStr: TaskPriorityDtoSchema.optional(),
  taskName: zod.string().optional(),
  taskDetails: zod.string().optional(),
  comments: zod.string().optional(),
  startTime: zod.number().optional(),
  endTime: zod.number().optional(),
});

export const NewSubTasksDtoSchema = zod.array(NewSubTaskDtoSchema);

export const SubTaskUpdateDataDtoSchema = TaskUpdateDataDtoSchema.extend({
  subTaskId: zod.number(),
});
