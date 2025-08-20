import { ApiTask, TaskItem, TaskStatus, TaskPriority, SortDirection, SortField } from "@/types/tasks.types";

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function convertApiTaskToLocal(apiTask: ApiTask): TaskItem {
  const pushCount = apiTask.push_count || 0;
  const cleanTaskName = apiTask.taskName.replace(/\s*\(x\d+\)\s*$/g, '').trim();
  const displayName = pushCount > 0 ? `${cleanTaskName} (x${pushCount})` : cleanTaskName;
  
  return {
    id: apiTask.taskId.toString(),
    apiTaskId: apiTask.taskId,
    userId: apiTask.userId,
    taskName: displayName,
    taskDetails: apiTask.taskDetails,
    comments: apiTask.comments,
    status: apiTask.status.status,
    priority: apiTask.priority.priority,
    startTime: apiTask.startTime,
    user: apiTask.user,
    endTime: apiTask.endTime,
    deleted: (apiTask.deleted || 0) === 1,
    push_count: apiTask.push_count || 0,
    archived: (apiTask.archived || 0) === 1,
    archived_at: apiTask.archived_at,
    completed:
      apiTask.status.status === "Done" || apiTask.status.status === "Completed",
    subTasks: apiTask.subTasks.map((st) => ({
      id: st.subTaskId.toString(),
      apiSubTaskId: st.subTaskId,
      taskName: st.taskName,
      taskDetails: st.taskDetails,
      comments: st.comments,
      status: st.status.status,
      priority: st.priority?.priority || "Moderate",
      startTime: st.startTime,
      endTime: st.endTime,
      completed:
        st.status.status === "Done" || st.status.status === "Completed",
      deleted: (st.deleted || 0) === 1,
    })),
  };
}

export function sortTasks(
  tasks: TaskItem[],
  order: SortDirection,
  orderBy: SortField
): TaskItem[] {
  return [...tasks].sort((a, b) => {
    const isAsc = order === "asc";

    switch (orderBy) {
      case "taskName":
        return isAsc
          ? a.taskName.localeCompare(b.taskName)
          : b.taskName.localeCompare(a.taskName);
      case "status":
        return isAsc
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      case "priority": {
        const priorityOrder: Record<string, number> = { Urgent: 0, High: 1, Moderate: 2, Low: 3 };
        const aPriority = priorityOrder[a.priority] ?? 999;
        const bPriority = priorityOrder[b.priority] ?? 999;
        return isAsc ? aPriority - bPriority : bPriority - aPriority;
      }
      case "startTime":
        return isAsc ? a.startTime - b.startTime : b.startTime - a.startTime;
      case "user": {
        const aUser = a.user ? `${a.user.firstName} ${a.user.lastName}` : "";
        const bUser = b.user ? `${b.user.firstName} ${b.user.lastName}` : "";
        return isAsc
          ? aUser.localeCompare(bUser)
          : bUser.localeCompare(aUser);
      }
      default:
        return 0;
    }
  });
}

export function filterTasks(
  tasks: TaskItem[],
  filters: {
    selectedStatusTab: string;
    statusFilter: string;
    monthFilter: string;
    priorityFilter: string;
    userFilter: string;
    dayFilter: string;
    dateFilter: string;
    taskNameFilter: string;
  }
): TaskItem[] {
  let result = tasks;

  // Filter by status tab
  if (filters.statusFilter === "Deleted") {
    result = result.filter((task) => task.deleted);
  } else if (filters.statusFilter) {
    result = result.filter((task) => task.status === filters.statusFilter);
  } else {
    if (filters.selectedStatusTab === "Deleted") {
      result = result.filter((task) => task.deleted);
    } else if (filters.selectedStatusTab !== "All") {
      result = result.filter((task) => task.status === filters.selectedStatusTab);
    } else {
      result = result.filter((task) => !task.deleted);
    }
  }

  // Filter by month
  if (filters.monthFilter) {
    const parts = filters.monthFilter.split('-');
    if (parts.length === 2) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      if (!isNaN(year) && !isNaN(month)) {
        result = result.filter((task) => {
          const taskDate = new Date(task.startTime);
          return taskDate.getFullYear() === year && 
                 taskDate.getMonth() === month - 1;
        });
      }
    }
  }

  // Filter by priority
  if (filters.priorityFilter) {
    result = result.filter((task) => task.priority === filters.priorityFilter);
  }

  // Filter by user
  if (filters.userFilter) {
    result = result.filter((task) => {
      if (!task.user) return false;
      const fullName = `${task.user.firstName} ${task.user.lastName}`;
      return fullName === filters.userFilter;
    });
  }

  // Filter by day
  if (filters.dayFilter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    result = result.filter((task) => {
      const taskDate = new Date(task.startTime);
      taskDate.setHours(0, 0, 0, 0);

      if (filters.dayFilter === "today") {
        return taskDate.getTime() === today.getTime();
      } else if (filters.dayFilter === "yesterday") {
        return taskDate.getTime() === yesterday.getTime();
      }
      return true;
    });
  }

  // Filter by date
  if (filters.dateFilter) {
    const selectedDate = new Date(filters.dateFilter);
    if (!isNaN(selectedDate.getTime())) {
      selectedDate.setHours(0, 0, 0, 0);

      result = result.filter((task) => {
        const taskDate = new Date(task.startTime);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === selectedDate.getTime();
      });
    }
  }

  // Filter by task name
  if (filters.taskNameFilter) {
    result = result.filter((task) =>
      task.taskName.toLowerCase().includes(filters.taskNameFilter.toLowerCase())
    );
  }

  return result;
}

export function groupTasksByWeek(tasks: TaskItem[]): Record<string, TaskItem[]> {
  const weekGroups: Record<string, TaskItem[]> = {};

  tasks.forEach((task) => {
    const date = new Date(task.startTime);
    const weekKey = getWeekOfMonth(date);

    if (!weekGroups[weekKey]) {
      weekGroups[weekKey] = [];
    }

    weekGroups[weekKey].push(task);
  });

  return weekGroups;
}

function getWeekOfMonth(date: Date): string {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const weekNumber = Math.ceil(dayOfMonth / 7);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return `${weekNumber}${getOrdinalSuffix(weekNumber)} week of ${
    monthNames[date.getMonth()]
  }`;
}

function getOrdinalSuffix(n: number): string {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}