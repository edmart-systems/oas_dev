import { ObjectVerifyResponse } from "@/types/other.types";
import { NewRawSubTask, NewRawTask } from "@/types/tasks.types";

export const validateNewRawSubTasks = (
  subTasks: NewRawSubTask[]
): ObjectVerifyResponse => {
  const errArr: string[] = [];
  subTasks.forEach((subTask, index) => {
    Object.keys(subTask).forEach((_key) => {
      const key = _key as keyof NewRawSubTask;
      const value = subTask[key];

      if (key === "taskName") {
        if (!value || String(value).length < 3) {
          errArr.push(`Sub task ${index + 1}: Task name too short.`);
        }
      }
    });
  });

  return errArr.length > 0 ? { valid: false, errors: errArr } : { valid: true };
};

export const validateNewRawSubTask = (
  subTask: NewRawSubTask
): ObjectVerifyResponse => {
  const errArr: string[] = [];
  Object.keys(subTask).forEach((_key) => {
    const key = _key as keyof NewRawSubTask;
    const value = subTask[key];

    if (key === "taskName") {
      if (!value || String(value).length < 3) {
        errArr.push(`Sub task name too short.`);
      }
    }
  });
  return errArr.length > 0 ? { valid: false, errors: errArr } : { valid: true };
};

export const validateNewRawTask = (task: NewRawTask): ObjectVerifyResponse => {
  const {} = task;
  const errArr: string[] = [];

  Object.keys(task).forEach((_key) => {
    const key = _key as keyof NewRawTask;
    const value = task[key];

    if (key === "taskName") {
      if (!value || String(value).length < 3) {
        errArr.push("Task name too short.");
      }
    }
  });

  return errArr.length > 0 ? { valid: false, errors: errArr } : { valid: true };
};
