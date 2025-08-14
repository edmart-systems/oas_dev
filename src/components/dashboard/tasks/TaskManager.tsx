// src/components/dashboard/tasks/TaskManager.tsx

"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { toast } from "react-toastify";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Tooltip from "@mui/material/Tooltip";
import { Box, Button, Card, CardContent, TextField, Typography, FormControl,InputLabel, Select, MenuItem, IconButton, Stack, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Divider, Chip, Skeleton, Tabs, Tab, Avatar, Menu, LinearProgress, Fab,
} from "@mui/material";
import { Add, Save, Refresh, Launch, ArrowDropDown, ExpandMore, ChevronRight, KeyboardArrowUp,
} from "@mui/icons-material";
import { PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";

type TaskStatus = "Pending" | "In-Progress" | "Stalled" | "Failed" | "Done" | "Completed" | "Cancelled";
type TaskPriority = "Urgent" | "High" | "Moderate" | "Low";
type SortDirection = "asc" | "desc";
type SortField = "taskName" | "startTime" | "priority" | "status" | "user";

// API Response Interfaces
interface ApiSubTask {
  subTaskId: number;
  taskId: number;
  statusId: number;
  priorityId?: number;
  taskName: string;
  taskDetails?: string;
  comments?: string;
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

interface ApiTask {
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
  };
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface TasksResponse {
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
interface SubTask {
  id: string; // Client-side generated ID for new subtasks
  apiSubTaskId?: number; // Backend ID for existing subtasks
  taskName: string;
  taskDetails?: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: number;
  endTime: number;
  completed: boolean;
}

interface Task {
  id: string; // Client-side generated ID for new tasks or stringified taskId from API
  apiTaskId?: number; // Backend ID for existing tasks
  taskId?: number; // Add taskId property for compatibility
  userId: number;
  taskName: string;
  taskDetails?: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: number;
  endTime: number;
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
  };
}

interface SubTaskForm {
  id: string; // Client-side generated ID
  apiSubTaskId?: number; // Backend ID for existing subtasks
  taskName: string;
  taskDetails?: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string; // ISO string for form input
  endTime: string; // ISO string for form input
  completed: boolean;
}

interface TaskForm {
  taskName: string;
  taskDetails?: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string; // ISO string for form input
  endTime: string; // ISO string for form input
  subTasks: SubTaskForm[];
  completed: boolean;
}

interface TaskManagerProps {
  userId: number;
  apiBaseUrl?: string;
}

const TASK_STATUSES: TaskStatus[] = [
  "Pending",
  "In-Progress",
  "Stalled",
  "Failed",
  "Done",
  "Completed",
  "Cancelled",
];
const TASK_PRIORITIES: TaskPriority[] = ["Urgent", "High", "Moderate", "Low"];

const now = new Date();
// Set to Uganda timezone (UTC+3)
const ugandaNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
const nowISO = ugandaNow.getFullYear() + '-' + 
  String(ugandaNow.getMonth() + 1).padStart(2, '0') + '-' + 
  String(ugandaNow.getDate()).padStart(2, '0') + 'T08:00';
const endISO = ugandaNow.getFullYear() + '-' + 
  String(ugandaNow.getMonth() + 1).padStart(2, '0') + '-' + 
  String(ugandaNow.getDate()).padStart(2, '0') + 'T23:59';
const todayISO = new Date().toISOString().slice(0, 10);

function isoToTimestamp(iso: string): number {
  return new Date(iso).getTime();
}

function timestampToISO(ts: number): string {
  const date = new Date(ts);
  return date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0') + 'T' + 
    String(date.getHours()).padStart(2, '0') + ':' + 
    String(date.getMinutes()).padStart(2, '0');
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

// Helper function to get week of month
function getWeekOfMonth(date: Date): string {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();

  // Calculate week number: days from start of month divided by 7, rounded up
  const weekNumber = Math.ceil(dayOfMonth / 7);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${weekNumber}${getOrdinalSuffix(weekNumber)} week of ${
    monthNames[date.getMonth()]
  }`;
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(n: number): string {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}


// Loading component
const MyCircularProgress = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

// Task status chip component
const TaskStatusChip = ({ status }: { status: TaskStatus }) => {
  const getColor = () => {
    switch (status) {
      case "Completed":
        return "success";
      case "Done":
        return "success";
      case "In-Progress":
        return "info";
      case "Pending":
        return "warning";
      case "Stalled":
        return "error";
      case "Failed":
        return "error";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Chip
      label={status}
      color={getColor() as any}
      size="small"
      variant="outlined"
    />
  );
};

// Task priority chip component
const TaskPriorityChip = ({ priority }: { priority: TaskPriority }) => {
  const getColor = () => {
    switch (priority) {
      case "Urgent":
        return "error";
      case "High":
        return "warning";
      case "Moderate":
        return "info";
      case "Low":
        return "success";
      default:
        return "default";
    }
  };

  return <Chip label={priority} color={getColor() as any} size="small" />;
};

// Task status InlineStatusSelect chip component
const InlineStatusSelect = ({ value, taskId, onUpdate}: {value: TaskStatus;taskId: string;
  onUpdate: (taskId: string, status: TaskStatus) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getColor = () => {
    switch (value) {
      case "Completed":
        return "success";
      case "Done":
        return "success";
      case "In-Progress":
        return "info";
      case "Pending":
        return "warning";
      case "Stalled":
        return "error";
      case "Failed":
        return "error";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {value}
            <ArrowDropDown sx={{ fontSize: 16 }} />
          </Box>
        }
        color={getColor() as any}
        size="small"
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ cursor: "pointer" }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            maxWidth: 160,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 2,
          },
        }}
      >
        {TASK_STATUSES.map((status) => {
          const getStatusColor = () => {
            switch (status) {
              case "Completed":
                return "success";
              case "Done":
                return "success";
              case "In-Progress":
                return "info";
              case "Pending":
                return "warning";
              case "Stalled":
                return "error";
              case "Failed":
                return "error";
              case "Cancelled":
                return "error";
              default:
                return "default";
            }
          };

          return (
            <MenuItem
              key={status}
              onClick={() => {
                onUpdate(taskId, status);
                setAnchorEl(null);
              }}
              sx={{ py: 1, px: 2 }}
            >
              <Chip
                label={status}
                color={getStatusColor() as any}
                size="small"
                variant="outlined"
                sx={{ minWidth: 100 }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

// Task status InlinePrioritySelect chip component
const InlinePrioritySelect = ({
  value,
  taskId,
  onUpdate,
}: {
  value: TaskPriority;
  taskId: string;
  onUpdate: (taskId: string, priority: TaskPriority) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getColor = () => {
    switch (value) {
      case "Urgent":
        return "error";
      case "High":
        return "warning";
      case "Moderate":
        return "info";
      case "Low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <>
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {value}
            <ArrowDropDown sx={{ fontSize: 16 }} />
          </Box>
        }
        color={getColor() as any}
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ cursor: "pointer" }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 140,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 2,
          },
        }}
      >
        {TASK_PRIORITIES.map((priority) => {
          const getPriorityColor = () => {
            switch (priority) {
              case "Urgent":
                return "error";
              case "High":
                return "warning";
              case "Moderate":
                return "info";
              case "Low":
                return "success";
              default:
                return "default";
            }
          };

          return (
            <MenuItem
              key={priority}
              onClick={() => {
                onUpdate(taskId, priority);
                setAnchorEl(null);
              }}
              sx={{ py: 1, px: 2 }}
            >
              <Chip
                label={priority}
                color={getPriorityColor() as any}
                size="small"
                sx={{ minWidth: 80 }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

// User avatar component
const UserAvatar = ({
  user,
  userId,
}: {
  user?: { firstName: string; lastName: string; email: string };
  userId?: number;
}) => {
  // Default display for when user data is not available
  let initials = userId ? `U${userId}` : "U";
  let tooltipText = userId ? `User ${userId}` : "Unknown User";

  // If user data is available, use it
  if (user) {
    // Use full name if available
    if (user.firstName && user.lastName) {
      initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
      tooltipText = `${user.firstName} ${user.lastName}`;
    }
    // Otherwise use whatever is available
    else if (user.firstName) {
      initials = user.firstName.charAt(0);
      tooltipText = user.firstName;
    } else if (user.lastName) {
      initials = user.lastName.charAt(0);
      tooltipText = user.lastName;
    }

    // Add email to tooltip if available
    if (user.email) {
      tooltipText += ` (${user.email})`;
    }
  }

  return (
    <Tooltip title={tooltipText}>
      <Avatar sx={{ width: 30, height: 30, fontSize: "0.8rem" }}>
        {initials}
      </Avatar>
    </Tooltip>
  );
};

// Task table tabs component
const TaskTableTabs = ({
  statusCounts,
  selectedTab,
  setSelectedTab,
  onAddTask,
}: {
  statusCounts: Record<TaskStatus, number>;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  onAddTask: () => void;
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", p: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        aria-label="task status tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab
          label={`All (${Object.values(statusCounts).reduce(
            (a, b) => a + b,
            0
          )})`}
          value="All"
        />
        {TASK_STATUSES.filter(status => status !== "Cancelled").map((status) => (
          <Tab
            key={status}
            label={`${status} (${statusCounts[status] || 0})`}
            value={status}
          />
        ))}
        <Tab
          key="Cancelled"
          label={`Deleted (${statusCounts["Cancelled"] || 0})`}
          value="Cancelled"
        />
      </Tabs>
      <IconButton
        color="primary"
        onClick={onAddTask}
        size="small"
        sx={{ ml: 2 }}
      >
        <Add />
      </IconButton>
    </Box>
  );
};

// Task filter components
const TaskMonthFilter = ({
  value,
  onChange,
  onLoadingChange,
}: {
  value: string;
  onChange: (value: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}) => {
  const months = [
    { value: "", label: "All Months" },
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
    { value: "2024-04", label: "April 2024" },
    { value: "2024-05", label: "May 2024" },
    { value: "2024-06", label: "June 2024" },
    { value: "2024-07", label: "July 2024" },
    { value: "2025-01", label: "January 2025" },
    { value: "2025-02", label: "February 2025" },
    { value: "2025-03", label: "March 2025" },
    { value: "2025-04", label: "April 2025" },
    { value: "2025-05", label: "May 2025" },
    { value: "2025-06", label: "June 2025" },
    { value: "2025-07", label: "July 2025" },
    { value: "2025-08", label: "August 2025" },
    { value: "2025-09", label: "September 2025" },
    { value: "2025-10", label: "October 2025" },
    { value: "2025-11", label: "November 2025" },
    { value: "2025-12", label: "December 2025" },
  ];

  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>Month</InputLabel>
      <Select
        label="Month"
        value={value}
        onChange={(e) => {
          onLoadingChange?.(true);
          setTimeout(() => {
            onChange(e.target.value);
            onLoadingChange?.(false);
          }, 100);
        }}
      >
        {months.map((month) => (
          <MenuItem key={month.value} value={month.value}>
            {month.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const TaskStatusFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Status</InputLabel>
      <Select
        label="Status"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Drafts">Deleted</MenuItem>
        {TASK_STATUSES.filter(status => status !== "Cancelled").map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const TaskPriorityFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Priority</InputLabel>
      <Select
        label="Priority"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        {TASK_PRIORITIES.map((priority) => (
          <MenuItem key={priority} value={priority}>
            {priority}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const TaskUserFilter = ({
  value,
  onChange,
  tasks,
}: {
  value: string;
  onChange: (value: string) => void;
  tasks: Task[];
}) => {
  const uniqueUsers = useMemo(() => {
    const users = new Map();
    tasks.forEach((task) => {
      if (task.user) {
        const fullName = `${task.user.firstName} ${task.user.lastName}`;
        users.set(fullName, task.user);
      }
    });
    return Array.from(users.entries());
  }, [tasks]);

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>User</InputLabel>
      <Select
        label="User"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        {uniqueUsers.map(([fullName, user]) => (
          <MenuItem key={fullName} value={fullName}>
            {fullName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const TaskDayFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Day</InputLabel>
      <Select
        label="Day"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="today">Today</MenuItem>
        <MenuItem value="yesterday">Yesterday</MenuItem>
      </Select>
    </FormControl>
  );
};

const TaskDateFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <TextField
      size="small"
      label="Date"
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      sx={{ minWidth: 150 }}
    />
  );
};

// API Service Functions
class TaskApiService {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // If response is not JSON, use the status text
          errorData = { message: response.statusText };
        }
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getCurrentMonthTasks(): Promise<TasksResponse> {
    const timestamp = Date.now();
    // Add parameters to fetch all users and their tasks
    const response = await this.makeRequest<TasksResponse>(
      `/tasks?t=${timestamp}`
    );
    return response.data;
  }

  async getTasksInRange(
    from: number,
    to: number,
    userId: number
  ): Promise<TasksResponse> {
    const response = await this.makeRequest<TasksResponse>(
      `/tasks/range?f=${from}&t=${to}`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      }
    );
    return response.data;
  }

  async createTask(userId: number, taskData: any): Promise<ApiTask> {
    const payload = {
      userId,
      newTask: taskData,
    };

    console.log("Creating task with payload:", JSON.stringify(payload));
    const response = await this.makeRequest<ApiTask>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  async updateTask(
    taskId: number,
    userId: number,
    taskData: any
  ): Promise<ApiTask> {
    const payload = {
      userId,
      taskData: {
        userId,
        taskId,
        ...taskData,
      },
    };
    
    console.log('API updateTask payload:', JSON.stringify(payload, null, 2));

    const response = await this.makeRequest<ApiTask>(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  async deleteTask(taskId: number, userId: number): Promise<ApiTask> {
    const response = await this.makeRequest<ApiTask>(`/tasks/${taskId}`, {
      method: "DELETE",
      body: JSON.stringify({ userId, taskId }),
    });
    return response.data;
  }

  async addSubTasks(
    taskId: number,
    userId: number,
    subTasks: any[]
  ): Promise<ApiTask> {
    // Process subtasks to ensure they have all required fields
    const processedSubTasks = subTasks.map((st) => ({
      taskId, // Ensure taskId is passed for new subtasks
      userId,
      taskName: st.taskName,
      taskDetails: st.taskDetails || "",
      comments: st.comments || "",
      status: st.status,
      priority: st.priority || "Moderate",
      startTime: st.startTime,
      endTime: st.endTime,
      time: st.endTime, // Redundant but keeping as per original API spec
    }));

    const payload = {
      userId,
      taskId,
      newSubTasks: processedSubTasks,
    };

    console.log("Adding subtasks with payload:", JSON.stringify(payload));
    const response = await this.makeRequest<ApiTask>("/tasks/subtasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  async updateSubTask(
    subTaskId: number,
    userId: number,
    subTaskData: any
  ): Promise<ApiTask> {
    const payload = {
      userId,
      subTaskData: {
        userId,
        subTaskId,
        taskId: subTaskData.taskId,
        taskName: subTaskData.taskName,
        taskDetails: subTaskData.taskDetails || "",
        comments: subTaskData.comments || "",
        status: subTaskData.status,
        priority: subTaskData.priority,
        startTime: subTaskData.startTime,
        endTime: subTaskData.endTime,
        time: subTaskData.endTime, // Redundant but keeping as per original API spec
      },
    };

    const response = await this.makeRequest<ApiTask>(
      `/tasks/subtasks/${subTaskId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  }

  async deleteSubTask(
    subTaskId: number,
    userId: number,
    taskId: number
  ): Promise<ApiSubTask> {
    const response = await this.makeRequest<ApiSubTask>(
      `/tasks/subtasks/${subTaskId}`,
      {
        method: "DELETE",
        body: JSON.stringify({ userId, taskId, subTaskId }),
      }
    );
    return response.data;
  }
}

// Helper function to convert API task to local task format
function convertApiTaskToLocal(apiTask: ApiTask): Task {
  return {
    id: apiTask.taskId.toString(),
    apiTaskId: apiTask.taskId,
    userId: apiTask.userId,
    taskName: apiTask.taskName,
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
    })),
  };
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  userId,
  apiBaseUrl = "/api",
}) => {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // State for table
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("All");
  const [inSearchMode, setInSearchMode] = useState(false);

  // State for sorting
  const [order, setOrder] = useState<SortDirection>("desc");
  const [orderBy, setOrderBy] = useState<SortField>("startTime");

  // State for filtering
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [taskNameFilter, setTaskNameFilter] = useState("");
  const [filterLoading, setFilterLoading] = useState(false);

  // State for task form

  const [editTaskId, setEditTaskId] = useState<string | null>(null);





  // state for expanded tasks
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  // State for back-to-top button
  const [showBackToTop, setShowBackToTop] = useState(false);

  // State for multi-task operations
  const [openMultiAdd, setOpenMultiAdd] = useState(false);
  const [openMultiEdit, setOpenMultiEdit] = useState(false);
  const [multiTaskData, setMultiTaskData] = useState<TaskForm[]>([]);
  const [multiEditData, setMultiEditData] = useState<Partial<TaskForm>>({});

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);



  // Add toggle function
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };
  // API service
  const apiService = useMemo(
    () => new TaskApiService(apiBaseUrl),
    [apiBaseUrl]
  );

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return tasks.reduce((counts, task) => {
      const status = task.status;
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {} as Record<TaskStatus, number>);
  }, [tasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // First filter by tab and view mode
    let result = tasks;
    
    console.log('Filtering tasks. statusFilter:', statusFilter);
    console.log('Total tasks before filtering:', result.length);
    
    if (statusFilter === "Drafts") {
      result = result.filter((task) => task.status === "Cancelled");
    } else if (statusFilter) {
      result = result.filter((task) => task.status === statusFilter);
    } else {
      if (selectedStatusTab === "Cancelled") {
        result = result.filter((task) => task.status === "Cancelled");
      } else if (selectedStatusTab !== "All") {
        result = result.filter((task) => task.status === selectedStatusTab);
      } else {
        // Filter out cancelled tasks but include failed tasks
        result = result.filter((task) => task.status !== "Cancelled");
        
        // Group by task name and keep only the latest (highest push_count) version for non-failed tasks
        const taskGroups = new Map<string, Task>();
        const failedTasks: Task[] = [];
        
        result.forEach(task => {
          if (task.status === "Failed") {
            failedTasks.push(task);
          } else {
            const existing = taskGroups.get(task.taskName);
            if (!existing || task.push_count > existing.push_count || 
                (task.push_count === existing.push_count && task.startTime > existing.startTime)) {
              taskGroups.set(task.taskName, task);
            }
          }
        });
        
        result = [...Array.from(taskGroups.values()), ...failedTasks];
      }
    }

    // Then apply additional filters
    if (monthFilter) {
      const [year, month] = monthFilter.split('-');
      result = result.filter((task) => {
        const taskDate = new Date(task.startTime);
        return taskDate.getFullYear() === parseInt(year) && 
               taskDate.getMonth() === parseInt(month) - 1;
      });
    }
    // Remove default month filtering - show all months when no filter is selected



    if (priorityFilter) {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    if (userFilter) {
      result = result.filter((task) => {
        if (!task.user) return false;
        const fullName = `${task.user.firstName} ${task.user.lastName}`;
        return fullName === userFilter;
      });
    }

    if (dayFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      result = result.filter((task) => {
        const taskDate = new Date(task.startTime);
        taskDate.setHours(0, 0, 0, 0);

        if (dayFilter === "today") {
          return taskDate.getTime() === today.getTime();
        } else if (dayFilter === "yesterday") {
          return taskDate.getTime() === yesterday.getTime();
        }
        return true;
      });
    }

    if (dateFilter) {
      const selectedDate = new Date(dateFilter);
      selectedDate.setHours(0, 0, 0, 0);

      result = result.filter((task) => {
        const taskDate = new Date(task.startTime);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === selectedDate.getTime();
      });
    }

    if (taskNameFilter) {
      result = result.filter((task) =>
        task.taskName.toLowerCase().includes(taskNameFilter.toLowerCase())
      );
    }

    // Then sort
    result = [...result].sort((a, b) => {
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
          const priorityOrder = { Urgent: 0, High: 1, Moderate: 2, Low: 3 };
          return isAsc
            ? priorityOrder[a.priority] - priorityOrder[b.priority]
            : priorityOrder[b.priority] - priorityOrder[a.priority];
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

    return result;
  }, [
    tasks,
    selectedStatusTab,
    monthFilter,
    statusFilter,
    priorityFilter,
    userFilter,
    dayFilter,
    dateFilter,
    taskNameFilter,
    order,
    orderBy,
  ]);

  // Group tasks by week, then by day, then by user

  const groupedTasks = useMemo(() => {
    const weekGroups: Record<string, Task[]> = {};

    filteredAndSortedTasks.forEach((task) => {
      const date = new Date(task.startTime);
      const weekKey = getWeekOfMonth(date);

      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = [];
      }

      weekGroups[weekKey].push(task);
    });

    return weekGroups;
  }, [filteredAndSortedTasks]);


  // Handlers
  const handleRequestSort = (property: SortField) => {
    setFilterLoading(true);
    setTimeout(() => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
      setFilterLoading(false);
    }, 100);
  };


  const handleSelectClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.apiTaskId) return;
    
    // Only allow users to update their own tasks
    if (task.userId !== userId) {
      toast("You can only update your own tasks", { type: "error" });
      return;
    }

    try {
      await apiService.updateTask(task.apiTaskId, userId, {
        status: newStatus,
      });

      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      if (newStatus !== "Cancelled" && newStatus !== "Pending") {
        toast("Status updated successfully", { type: "success" });
      }
    } catch (err) {
      toast("Failed to update status", { type: "error" });
    }
  };

  const handlePriorityUpdate = async (
    taskId: string,
    newPriority: TaskPriority
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.apiTaskId) return;
    
    // Only allow users to update their own tasks
    if (task.userId !== userId) {
      toast("You can only update your own tasks", { type: "error" });
      return;
    }

    try {
      await apiService.updateTask(task.apiTaskId, userId, {
        priority: newPriority,
      });

      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
      );

      toast("Priority updated successfully", { type: "success" });
    } catch (err) {
      toast("Failed to update priority", { type: "error" });
    }
  };

  const resetSearchParams = () => {
    setInSearchMode(false);
    setSelectedStatusTab("All");
    setMonthFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setUserFilter("");
    setDayFilter("");
    setDateFilter("");
    setTaskNameFilter("");
  };

  const refreshHandler = async () => {
    setLoading(true);
    try {
      // Load all tasks from 2024-2026 range so month filtering works
      const startOf2024 = new Date('2024-01-01').getTime();
      const endOf2026 = new Date('2026-12-31').getTime();
      
      const response = await apiService.getTasksInRange(
        startOf2024,
        endOf2026,
        0 // Use 0 to get all users' tasks
      );
      const transformedTasks: Task[] = [];
      let currentUserName = "";

      console.log('Raw API response tasks:', response.tasks);

      for (const taskGroup of Object.values(response.tasks)) {
        for (const apiTask of taskGroup) {
          console.log('Processing task:', apiTask.taskId, 'deleted:', apiTask.deleted, 'archived:', apiTask.archived);
          // Don't override user data - keep whatever comes from API
          if (!apiTask.user) {
            // Only add fallback if no user data exists
            apiTask.user = {
              co_user_id: apiTask.userId,
              firstName: `User`,
              lastName: `${apiTask.userId}`,
              email: "",
            };
          }

          // Set current user name for default filter
          if (apiTask.userId === userId && apiTask.user) {
            currentUserName = `${apiTask.user.firstName} ${apiTask.user.lastName}`;
          }

          const localTask = convertApiTaskToLocal(apiTask);
          console.log('Converted task:', localTask.taskId || localTask.id, 'deleted:', localTask.deleted, 'archived:', localTask.archived);
          transformedTasks.push(localTask);
        }
      }
      
      console.log('Total tasks loaded:', transformedTasks.length);
      console.log('Deleted tasks:', transformedTasks.filter(t => t.deleted).length);
      console.log('Archived tasks:', transformedTasks.filter(t => t.archived).length);

      setTasks(transformedTasks);
      
      // Set default filter to current user's tasks
      if (currentUserName && !userFilter) {
        setUserFilter(currentUserName);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      toast(err instanceof Error ? err.message : "Failed to fetch tasks", { type: "error" });
    } finally {
      setLoading(false);
    }
  };



  // Soft delete task (mark as cancelled)
  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      if (taskToDelete === 'multiple') {
        await confirmDeleteSelected();
      } else {
        await handleStatusUpdate(taskToDelete, "Cancelled");
        toast("Task deleted", { type: "success" });
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete task", { type: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  // Restore deleted task
  const handleRestoreTask = async (taskId: string) => {
    try {
      await handleStatusUpdate(taskId, "Pending");
      toast("Task restored", { type: "success" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to restore task", { type: "error" });
    }
  };

  // Delete selected tasks
  const handleDeleteSelected = () => {
    setTaskToDelete('multiple');
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSelected = async () => {
    setLoading(true);
    try {
      for (const id of selected) {
        await handleStatusUpdate(id, "Cancelled");
      }
      toast(`${selected.length} tasks deleted`, { type: "success" });
      setSelected([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete tasks", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Multi-task operations
  const handleOpenMultiAdd = () => {
    setEditTaskId(null);
    setMultiTaskData([
      {
        taskName: "",
        taskDetails: "",
        comments: "",
        status: "Pending",
        priority: "Moderate",
        startTime: nowISO,
        endTime: endISO,
        subTasks: [],
        completed: false,
      },
      {
        taskName: "",
        taskDetails: "",
        comments: "",
        status: "Pending",
        priority: "Moderate",
        startTime: nowISO,
        endTime: endISO,
        subTasks: [],
        completed: false,
      },
    ]);
    setOpenMultiAdd(true);
  };

  const addMultiTask = () => {
    setMultiTaskData((prev) => [
      ...prev,
      {
        taskName: "",
        taskDetails: "",
        comments: "",
        status: "Pending",
        priority: "Moderate",
        startTime: nowISO,
        endTime: endISO,
        subTasks: [],
        completed: false,
      },
    ]);
  };

  const removeMultiTask = (index: number) => {
    setMultiTaskData((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMultiTask = useCallback((index: number, field: keyof TaskForm, value: any) => {
    setMultiTaskData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  }, []);

  const addMultiSubTask = useCallback((taskIndex: number) => {
    const parentTask = multiTaskData[taskIndex];
    const newSubTask: SubTaskForm = {
      id: generateId(),
      taskName: "",
      taskDetails: "",
      comments: "",
      status: parentTask?.status || "Pending",
      priority: parentTask?.priority || "Moderate",
      startTime: nowISO,
      endTime: endISO,
      completed: false,
    };
    setMultiTaskData((prev) => {
      const newData = [...prev];
      newData[taskIndex] = { ...newData[taskIndex], subTasks: [...newData[taskIndex].subTasks, newSubTask] };
      return newData;
    });
  }, []);

  const removeMultiSubTask = useCallback((taskIndex: number, subTaskIndex: number) => {
    setMultiTaskData((prev) => {
      const newData = [...prev];
      newData[taskIndex] = { 
        ...newData[taskIndex], 
        subTasks: newData[taskIndex].subTasks.filter((_, i) => i !== subTaskIndex) 
      };
      return newData;
    });
  }, []);

  const updateMultiSubTask = useCallback((taskIndex: number, subTaskIndex: number, field: keyof SubTaskForm, value: any) => {
    setMultiTaskData((prev) => {
      const newData = [...prev];
      const newSubTasks = [...newData[taskIndex].subTasks];
      newSubTasks[subTaskIndex] = { ...newSubTasks[subTaskIndex], [field]: value };
      newData[taskIndex] = { ...newData[taskIndex], subTasks: newSubTasks };
      return newData;
    });
  }, []);

  const handleMultiAdd = async () => {
    setLoading(true);
    try {
      let successCount = 0;
      for (let i = 0; i < multiTaskData.length; i++) {
        const taskData = multiTaskData[i];
        if (taskData.taskName.trim()) {
          if (editTaskId && i === 0) {
            // Update existing task
            const task = tasks.find((t) => t.id === editTaskId);
            if (task?.apiTaskId) {
              await apiService.updateTask(task.apiTaskId, userId, {
                taskName: taskData.taskName.trim(),
                taskDetails: taskData.taskDetails?.trim() || "",
                comments: taskData.comments?.trim() || "",
                statusStr: taskData.status,
                priorityStr: taskData.priority,
                startTime: isoToTimestamp(taskData.startTime),
                endTime: isoToTimestamp(taskData.endTime),
              });
              successCount++;
            }
          } else {
            // Create new task with subtasks
            const subtasksPayload = taskData.subTasks
              .filter(st => st.taskName.trim()) // Only include subtasks with names
              .map(st => ({
                userId,
                taskId: 0, // Placeholder - will be set by backend
                taskName: st.taskName.trim(),
                taskDetails: st.taskDetails?.trim() || "",
                comments: st.comments?.trim() || "",
                status: st.status,
                priority: st.priority,
                startTime: isoToTimestamp(st.startTime),
                endTime: isoToTimestamp(st.endTime),
                time: isoToTimestamp(st.endTime),
              }));

            await apiService.createTask(userId, {
              userId,
              taskName: taskData.taskName.trim(),
              taskDetails: taskData.taskDetails?.trim() || "",
              comments: taskData.comments?.trim() || "",
              status: taskData.status,
              priority: taskData.priority,
              startTime: isoToTimestamp(taskData.startTime),
              endTime: isoToTimestamp(taskData.endTime),
              time: isoToTimestamp(taskData.endTime),
              subTasks: subtasksPayload,
            });
            successCount++;
          }
        }
      }
      // Process any expired tasks after creation
      try {
        await fetch('/api/tasks/expire', { method: 'POST' });
      } catch (err) {
        console.log('Failed to process expired tasks:', err);
      }
      
      toast(`${successCount} tasks ${editTaskId ? 'updated' : 'created'} successfully`, { type: "success" });
      setEditTaskId(null);
      setOpenMultiAdd(false);
      await refreshHandler();
    } catch (err) {
      console.error('Multi-add error:', err);
      toast(`Error: ${err instanceof Error ? err.message : "Failed to process tasks"}`, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleMultiEdit = async () => {
    setLoading(true);
    try {
      let successCount = 0;
      for (const id of selected) {
        const task = tasks.find((t) => t.id === id);
        if (task?.apiTaskId && task.userId === userId) {
          const updateData: any = {};
          if (multiEditData.status) updateData.status = multiEditData.status;
          if (multiEditData.priority) updateData.priority = multiEditData.priority;
          
          if (Object.keys(updateData).length > 0) {
            await apiService.updateTask(task.apiTaskId, userId, updateData);
            successCount++;
          }
        }
      }
      
      // Update local state
      setTasks((prev) =>
        prev.map((task) => {
          if (selected.includes(task.id) && task.userId === userId) {
            const updates: any = {};
            if (multiEditData.status) updates.status = multiEditData.status;
            if (multiEditData.priority) updates.priority = multiEditData.priority;
            return { ...task, ...updates };
          }
          return task;
        })
      );
      
      toast(`${successCount} tasks updated successfully`, { type: "success" });
      setSelected([]);
      setOpenMultiEdit(false);
    } catch (err) {
      toast(`Error: ${err instanceof Error ? err.message : "Failed to update tasks"}`, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Back to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  // Load tasks on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Process expired tasks first
      try {
        await fetch('/api/tasks/expire', { method: 'POST' });
      } catch (err) {
        console.log('Failed to process expired tasks on load:', err);
      }
      // Then load tasks
      await refreshHandler();
    };
    initializeData();
  }, []);



  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update search mode when filters change
  useEffect(() => {
    setInSearchMode(
      monthFilter !== "" ||
        statusFilter !== "" ||
        priorityFilter !== "" ||
        userFilter !== "" ||
        dayFilter !== "" ||
        dateFilter !== "" ||
        taskNameFilter !== "" ||
        selectedStatusTab !== "All"
    );
  }, [
    monthFilter,
    statusFilter,
    priorityFilter,
    userFilter,
    dayFilter,
    dateFilter,
    taskNameFilter,
    selectedStatusTab,
  ]);

  return (
    <>
      <Card
        sx={{
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Suspense fallback={<MyCircularProgress />}>
          <TaskTableTabs
            statusCounts={statusCounts}
            selectedTab={selectedStatusTab}
            setSelectedTab={setSelectedStatusTab}
            onAddTask={handleOpenMultiAdd}
          />
        </Suspense>
        <Divider />
        <CardContent>
          <Box sx={{ overflowX: "auto", width: "100%", p: 1, "&::-webkit-scrollbar": {height: 4} }}>
            <Stack 
              direction="row" 
              justifyContent="space-between"
              sx={{ minWidth: "max-content" }}
            >
              <Stack spacing={2} direction="row" sx={{ minWidth: "max-content" }}>
                <TextField
                  size="small"
                  placeholder="Search tasks..."
                  value={taskNameFilter}
                  onChange={(e) => setTaskNameFilter(e.target.value)}
                  sx={{ minWidth: 150 }}
                />
                <Suspense fallback={<MyCircularProgress />}>
                  <TaskMonthFilter value={monthFilter} onChange={setMonthFilter} onLoadingChange={setFilterLoading} />
                </Suspense>
                <Suspense fallback={<MyCircularProgress />}>
                  <TaskStatusFilter
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </Suspense>
                <Suspense fallback={<MyCircularProgress />}>
                  <TaskPriorityFilter
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                  />
                  <Suspense fallback={<MyCircularProgress />}>
                    <TaskUserFilter
                      value={userFilter}
                      onChange={setUserFilter}
                      tasks={tasks}
                    />
                  </Suspense>
                  <Suspense fallback={<MyCircularProgress />}>
                    <TaskDayFilter value={dayFilter} onChange={setDayFilter} />
                  </Suspense>
                  <Suspense fallback={<MyCircularProgress />}>
                    <TaskDateFilter value={dateFilter} onChange={setDateFilter} />
                  </Suspense>
                </Suspense>
                {inSearchMode && (
                  <Button variant="text" onClick={resetSearchParams}>
                    Clear Filters
                  </Button>
                )}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ minWidth: "max-content", paddingLeft:"15px" }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenMultiAdd}
                  size="small"
                >
                  Add Tasks
                </Button>
                

                


                {loading ? (
                  <MyCircularProgress />
                ) : (
                  <Tooltip title="Refresh">
                    <IconButton
                      size="small"
                      onClick={refreshHandler}
                      color="primary"
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Box>

          {selected.length > 0 && (
            <Box mt={2}>
              <Stack spacing={2} direction="row" alignItems="center">
                <Typography variant="subtitle1">
                  {selected.length} Selected
                </Typography>
                {(statusFilter === "Drafts" || selectedStatusTab === "Cancelled") ? (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<Launch />}
                    onClick={() => {
                      selected.forEach(id => handleRestoreTask(id));
                      setSelected([]);
                    }}
                  >
                    Restore Selected
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PencilSimple />}
                      onClick={() => setOpenMultiEdit(true)}
                      size="small"
                    >
                      Edit Selected
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Trash />}
                      onClick={handleDeleteSelected}
                    >
                      Delete Selected
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
        <Divider />

        {/* Progress bar for filtering/sorting */}
        {filterLoading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Hierarchical grouping view: Week > Day > User > Tasks */}
        {/* Week level with single table */}
        {Object.entries(groupedTasks).map(([weekKey, weekTasks]) => (
          <Box
            key={weekKey}
            mb={5}
            sx={{ ml: 2 }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              {weekKey}
            </Typography>

            <Card variant="outlined" sx={{ mb: 2, overflow: "hidden" }}>
              <TableContainer
                sx={{
                  maxHeight: "70vh",
                  overflow: "auto",
                  width: "100%",
                  '&::-webkit-scrollbar': {
                    height: '2px',
                    width: '2px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#ff9800',
                    borderRadius: '2px',
                  },
                }}
              >
                <Table
                  size="small"
                  sx={{ 
                    width: "100%", 
                    tableLayout: "auto", 
                    minWidth: 800,
                    borderCollapse: 'separate',
                    '& .MuiTableCell-root': {
                      padding: '0px 4px',
                      border: '1px solid #e0e0e0',
                      fontSize: '0.75rem',
                      lineHeight: 1.2
                    },
                    '& .MuiTableHead-root .MuiTableCell-root': {
                      backgroundColor: 'action.hover',
                      fontWeight: 600,
                      borderBottom: '2px solid',
                      borderBottomColor: 'divider',
                      color: 'text.primary'
                    },
                    '& .MuiTableRow-root:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ width: "30px", px: 0.5 }}>
                        <Checkbox
                          color="primary"
                          indeterminate={
                            selected.filter((id) =>
                              weekTasks.some((t) => t.id === id && t.userId === userId)
                            ).length > 0 &&
                            selected.filter((id) =>
                              weekTasks.some((t) => t.id === id && t.userId === userId)
                            ).length < weekTasks.filter(t => t.userId === userId).length
                          }
                          checked={
                            weekTasks.filter(t => t.userId === userId).length > 0 &&
                            selected.filter((id) =>
                              weekTasks.some((t) => t.id === id && t.userId === userId)
                            ).length === weekTasks.filter(t => t.userId === userId).length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSelected = [
                                ...selected,
                                ...weekTasks
                                  .filter((t) => t.userId === userId)
                                  .map((t) => t.id)
                                  .filter((id) => !selected.includes(id)),
                              ];
                              setSelected(newSelected);
                            } else {
                              setSelected(
                                selected.filter(
                                  (id) =>
                                    !weekTasks.some((task) => task.id === id && task.userId === userId)
                                )
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: "350px", width: "50%" }}>
                        <TableSortLabel
                          active={orderBy === "taskName"}
                          direction={orderBy === "taskName" ? order : "asc"}
                          onClick={() => handleRequestSort("taskName")}
                        >
                          Task
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ width: "60px" }}>
                        <TableSortLabel
                          active={orderBy === "user"}
                          direction={orderBy === "user" ? order : "asc"}
                          onClick={() => handleRequestSort("user")}
                        >
                          User
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ width: "130px" }}>
                        <TableSortLabel
                          active={orderBy === "status"}
                          direction={orderBy === "status" ? order : "asc"}
                          onClick={() => handleRequestSort("status")}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ width: "100px" }}>
                        <TableSortLabel
                          active={orderBy === "startTime"}
                          direction={orderBy === "startTime" ? order : "asc"}
                          onClick={() => handleRequestSort("startTime")}
                        >
                          Start Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ width: "100px" }}>
                        End Date
                      </TableCell>
                      <TableCell sx={{ width: "130px" }}>
                        <TableSortLabel
                          active={orderBy === "priority"}
                          direction={orderBy === "priority" ? order : "asc"}
                          onClick={() => handleRequestSort("priority")}
                        >
                          Priority
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ minWidth: "200px" }}>Notes</TableCell>
                      <TableCell sx={{ width: "100px" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weekTasks
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((task, index) => {
                        const isItemSelected = selected.includes(task.id);
                        const labelId = `checkbox-${weekKey}-${index}`;

                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={task.id}
                            selected={isItemSelected}
                            sx={{ cursor: "pointer" }}
                          >
                            <TableCell
                              padding="checkbox"
                              sx={{ maxWidth: "30px", px: 0.5 }}
                            >
                              {task.userId === userId ? (
                                <Checkbox
                                  color="primary"
                                  checked={isItemSelected}
                                  onClick={(event) =>
                                    handleSelectClick(event, task.id)
                                  }
                                  inputProps={{ "aria-labelledby": labelId }}
                                />
                              ) : (
                                <Box sx={{ width: 14, height: 14 }} />
                              )}
                            </TableCell>
                            <TableCell sx={{ minWidth: "350px", width: "50%", py: 1 }}>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {task.subTasks.length > 0 && (
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleTaskExpansion(task.id)}
                                    sx={{ mr: 0.5, p: 0.25, minWidth: 20 }}
                                  >
                                    {expandedTasks.has(task.id) ? (
                                      <ExpandMore sx={{ fontSize: 14 }} />
                                    ) : (
                                      <ChevronRight sx={{ fontSize: 14 }} />
                                    )}
                                  </IconButton>
                                )}
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                                  >
                                    {task.taskName}{task.push_count > 0 && ` (x${task.push_count})`}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Collapsible subtasks */}
                              {task.subTasks.length > 0 &&
                                expandedTasks.has(task.id) && (
                                  <Box
                                    sx={{
                                      mt: 0.5,
                                      ml: 0.5,
                                      borderLeft: "1px solid",
                                      borderColor: "divider",
                                      pl: 0.5,
                                    }}
                                  >
                                    {task.subTasks.map((subtask) => (
                                      <Box key={subtask.id} sx={{ py: 0.25 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{ fontWeight: 500, fontSize: '0.8rem', lineHeight: 1.2 }}
                                        >
                                          • {subtask.taskName}
                                        </Typography>
                                        {subtask.taskDetails && (
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.7rem', lineHeight: 1.1 }}
                                          >
                                            {subtask.taskDetails}
                                          </Typography>
                                        )}
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                            </TableCell>

                            <TableCell sx={{ maxWidth: "40px" }}>
                              <UserAvatar
                                user={task.user}
                                userId={task.userId}
                              />
                            </TableCell>
                            <TableCell sx={{ minWidth: "140px", width: "140px" }}>
                              {task.userId === userId && task.endTime >= Date.now() && task.status !== "Failed" ? (
                                <InlineStatusSelect
                                  value={task.status}
                                  taskId={task.id}
                                  onUpdate={handleStatusUpdate}
                                />
                              ) : (
                                <TaskStatusChip status={task.status} />
                              )}
                            </TableCell>
                            <TableCell sx={{ maxWidth: "80px" }}>
                              {new Date(task.startTime).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ maxWidth: "80px" }}>
                              {new Date(task.endTime).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ minWidth: "140px", width: "140px" }}>
                              {task.userId === userId && task.endTime >= Date.now() && task.status !== "Failed" ? (
                                <InlinePrioritySelect
                                  value={task.priority}
                                  taskId={task.id}
                                  onUpdate={handlePriorityUpdate}
                                />
                              ) : (
                                <TaskPriorityChip priority={task.priority} />
                              )}
                            </TableCell>
                            <TableCell sx={{ minWidth: "200px", width: "25%", py: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "normal",
                                  wordWrap: "break-word",
                                  maxHeight: "100px",
                                  overflow: "auto",
                                }}
                              >
                                {task.comments || task.taskDetails || "-"}
                              </Typography>

                            </TableCell>

                            <TableCell sx={{ maxWidth: "80px" }}>
                              {task.userId === userId ? (
                                <>
                                  {(statusFilter === "Drafts" || selectedStatusTab === "Cancelled") ? (
                                    <Tooltip title="Restore">
                                      <IconButton
                                        color="success"
                                        onClick={() => handleRestoreTask(task.id)}
                                        size="small"
                                      >
                                        <Launch
                                          sx={{ width: "18px", height: "18px" }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  ) : task.status === "Failed" ? (
                                    <Typography variant="caption" color="text.secondary">
                                      Expired - View Only
                                    </Typography>
                                  ) : (
                                    <>
                                      <Tooltip title={task.endTime < Date.now() ? "Task ended - cannot edit" : "Edit"}>
                                        <IconButton
                                          color="primary"
                                          onClick={() => {
                                            setMultiTaskData([{
                                              taskName: task.taskName,
                                              taskDetails: task.taskDetails || "",
                                              comments: task.comments || "",
                                              status: task.status,
                                              priority: task.priority,
                                              startTime: timestampToISO(task.startTime),
                                              endTime: timestampToISO(task.endTime),
                                              subTasks: task.subTasks.map((st) => ({
                                                id: st.id,
                                                apiSubTaskId: st.apiSubTaskId,
                                                taskName: st.taskName,
                                                taskDetails: st.taskDetails || "",
                                                comments: st.comments || "",
                                                status: st.status,
                                                priority: st.priority,
                                                startTime: timestampToISO(st.startTime),
                                                endTime: timestampToISO(st.endTime),
                                                completed: st.completed,
                                              })),
                                              completed: task.completed,
                                            }]);
                                            setEditTaskId(task.id);
                                            setOpenMultiAdd(true);
                                          }}
                                          size="small"
                                          disabled={task.endTime < Date.now() || (task.status as TaskStatus) === "Failed"}
                                        >
                                          <PencilSimple
                                            size={18}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete">
                                        <IconButton
                                          color="error"
                                          onClick={() => handleDeleteTask(task.id)}
                                          size="small"
                                        >
                                          <Trash
                                            size={18}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                    </>
                                  )}
                                </>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  View Only
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 30]}
                component="div"
                count={weekTasks.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Card>
          </Box>
        ))}

        {/* Empty state */}
        {Object.keys(groupedTasks).length === 0 && !loading && (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              {(statusFilter === "Drafts" || selectedStatusTab === "Cancelled") ? "No deleted tasks." : "No tasks found. Click \"Add Tasks\" to create one."}
            </Typography>
          </Box>
        )}

        {/* Loading state */}
        {loading && (
          <Box p={2}>
            {Array.from(Array(3)).map((_, index) => (
              <Box key={`skeleton-${index}`} mb={2}>
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={100} sx={{ mt: 1 }} />
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {/* Multi-Add Tasks Dialog */}
      <Dialog
        open={openMultiAdd}
        onClose={() => !loading && setOpenMultiAdd(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">{editTaskId ? 'Edit Task' : `Add Multiple Tasks (${multiTaskData.length})`}</Typography>
            {!editTaskId && (
              <Button
                startIcon={<Add />}
                onClick={addMultiTask}
                variant="outlined"
                size="small"
                disabled={loading}
              >
                Add Task
              </Button>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ overflow: 'auto' }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 2, 
            mt: 1 
          }}>
            {multiTaskData.map((task, index) => (
              <Card key={index} sx={{ p: 2, height: 'fit-content' }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">Task {index + 1}</Typography>
                  {multiTaskData.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeMultiTask(index)}
                      disabled={loading}
                    >
                      <Trash size={16} />
                    </IconButton>
                  )}
                </Box>
                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <TextField
                    label="Task Name"
                    value={task.taskName}
                    onChange={(e) => updateMultiTask(index, "taskName", e.target.value)}
                    fullWidth
                    required
                    disabled={loading}
                    size="small"
                  />
                  <TextField
                    label="Details"
                    value={task.taskDetails || ""}
                    onChange={(e) => updateMultiTask(index, "taskDetails", e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    disabled={loading}
                    size="small"
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <FormControl fullWidth disabled={loading || !editTaskId} size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={task.status}
                        onChange={(e) => updateMultiTask(index, "status", e.target.value)}
                        label="Status"
                      >
                        {TASK_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth disabled={loading} size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={task.priority}
                        onChange={(e) => updateMultiTask(index, "priority", e.target.value)}
                        label="Priority"
                      >
                        {TASK_PRIORITIES.map((priority) => (
                          <MenuItem key={priority} value={priority}>
                            {priority}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={task.startTime.slice(0, 10)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    disabled={true}
                    size="small"
                  />
                  <TextField
                    label="Start Time"
                    type="time"
                    value={task.startTime.slice(11, 16)}
                    onChange={(e) => updateMultiTask(index, "startTime", task.startTime.slice(0, 11) + e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                    size="small"
                  />
                  <TextField
                    label="End Time"
                    type="datetime-local"
                    value={task.endTime}
                    onChange={(e) => updateMultiTask(index, "endTime", e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                    size="small"
                  />
                  
                  {/* Subtasks section */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="caption" color="primary">Subtasks ({task.subTasks.length})</Typography>
                      <IconButton
                        size="small"
                        onClick={() => addMultiSubTask(index)}
                        disabled={loading}
                      >
                        <Add sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                    
                    {task.subTasks.map((subTask, subIndex) => (
                      <Box key={subTask.id} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="caption">Sub {subIndex + 1}</Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeMultiSubTask(index, subIndex)}
                            disabled={loading}
                          >
                            <Trash size={12} />
                          </IconButton>
                        </Box>
                        <TextField
                          label="Subtask Name"
                          value={subTask.taskName}
                          onChange={(e) => updateMultiSubTask(index, subIndex, "taskName", e.target.value)}
                          fullWidth
                          size="small"
                          disabled={loading}
                          sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <TextField
                            label="Status"
                            value={task?.status || "Pending"}
                            fullWidth
                            size="small"
                            disabled={true}
                          />
                          <TextField
                            label="Priority"
                            value={task?.priority || "Moderate"}
                            fullWidth
                            size="small"
                            disabled={true}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenMultiAdd(false);
            setEditTaskId(null);
          }} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleMultiAdd}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading || !multiTaskData.some(t => t.taskName.trim())}
          >
            {editTaskId ? 'Update Task' : 'Create All Tasks'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Multi-Edit Tasks Dialog */}
      <Dialog
        open={openMultiEdit}
        onClose={() => !loading && setOpenMultiEdit(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit {selected.length} Selected Tasks</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Only fields with values will be updated. Leave blank to keep existing values.
            </Typography>
            
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Status</InputLabel>
              <Select
                value={multiEditData.status || ""}
                onChange={(e) => setMultiEditData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                label="Status"
              >
                <MenuItem value="">Keep existing</MenuItem>
                {TASK_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={multiEditData.priority || ""}
                onChange={(e) => setMultiEditData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                label="Priority"
              >
                <MenuItem value="">Keep existing</MenuItem>
                {TASK_PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMultiEdit(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleMultiEdit}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading || (!multiEditData.status && !multiEditData.priority)}
          >
            Update Tasks
          </Button>
        </DialogActions>
      </Dialog>



      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            {taskToDelete === 'multiple' 
              ? `${selected.length} tasks will be deleted.`
              : 'Task will be deleted.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteTask} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>



      {/* Back to Top Button */}
      {showBackToTop && (
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </>
  );
};

export default TaskManager;
