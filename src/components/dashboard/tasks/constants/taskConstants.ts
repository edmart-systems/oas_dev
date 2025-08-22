import { TaskStatus, TaskPriority } from "@/types/tasks.types";

export const TASK_STATUSES: TaskStatus[] = [
  "Pending",
  "In-Progress",
  "Stalled",
  "Failed",
  "Done",
  "Completed",
  "Pushed",
  "Cancelled"
];

export const EDITABLE_TASK_STATUSES: TaskStatus[] = [
  "Pending",
  "In-Progress",
  "Stalled",
  "Failed",
  "Done",
  "Completed",
  "Pushed",
  "Cancelled"
];

export const TASK_PRIORITIES: TaskPriority[] = ["Urgent", "High", "Moderate", "Low"];