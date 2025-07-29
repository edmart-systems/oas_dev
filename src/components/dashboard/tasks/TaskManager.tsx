// src/components/dashboard/tasks/TaskManager.tsx

"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Tooltip from "@mui/material/Tooltip";
import { Box, Button, Card, CardContent, TextField, Typography, FormControl,InputLabel, Select, MenuItem, IconButton, Stack, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar, Alert, Divider, Chip, Skeleton, Tabs, Tab, Avatar, Menu,
} from "@mui/material";
import { Add, Delete, Edit, Save, Refresh, Launch, Sort, ArrowDropDown, ExpandMore, ChevronRight,
} from "@mui/icons-material";

type TaskStatus = "Pending" | "In-Progress" | "Stalled" | "Failed" | "Done" | "Completed";
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
  taskDetails: string;
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
  taskDetails: string;
  comments?: string;
  taskLocked: boolean;
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
  taskDetails: string;
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
  userId: number;
  taskName: string;
  taskDetails: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: number;
  endTime: number;
  subTasks: SubTask[];
  completed: boolean;
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
  taskDetails: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string; // ISO string for form input
  endTime: string; // ISO string for form input
  completed: boolean;
}

interface TaskForm {
  taskName: string;
  taskDetails: string;
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
];
const TASK_PRIORITIES: TaskPriority[] = ["Urgent", "High", "Moderate", "Low"];

const nowISO = new Date().toISOString().slice(0, 16);

function isoToTimestamp(iso: string): number {
  return new Date(iso).getTime();
}

function timestampToISO(ts: number): string {
  return new Date(ts).toISOString().slice(0, 16);
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

// Helper function to get week of month
function getWeekOfMonth(date: Date): string {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();

  // Adjust for first day of week
  const dayOffset = firstDayOfMonth.getDay();
  const weekNumber = Math.ceil((dayOfMonth + dayOffset) / 7);

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
}: {
  statusCounts: Record<TaskStatus, number>;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", p: 1 }}>
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
        {TASK_STATUSES.map((status) => (
          <Tab
            key={status}
            label={`${status} (${statusCounts[status] || 0})`}
            value={status}
          />
        ))}
      </Tabs>
    </Box>
  );
};

// Task filter components
const TaskMonthFilter = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const months = [
    { value: "", label: "Current Month" },
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
        onChange={(e) => onChange(e.target.value)}
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
        {TASK_STATUSES.map((status) => (
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
    // Process subtasks to ensure they have all required fields
    const processedSubTasks =
      taskData.subTasks?.map((st: any) => ({
        userId,
        taskName: st.taskName,
        taskDetails: st.taskDetails,
        comments: st.comments || "",
        status: st.status,
        priority: st.priority || "Moderate",
        startTime: st.startTime,
        endTime: st.endTime,
        time: st.endTime, // Redundant but keeping as per original API spec
      })) || [];

    const payload = {
      userId,
      newTask: {
        userId,
        taskName: taskData.taskName,
        taskDetails: taskData.taskDetails,
        comments: taskData.comments || "",
        status: taskData.status,
        priority: taskData.priority,
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        time: taskData.endTime, // Redundant but keeping as per original API spec
        subTasks: processedSubTasks,
      },
    };

    console.log("Creating task with payload:", JSON.stringify(payload));
    const response = await this.makeRequest<ApiTask>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  // Update your updateTask method in TaskApiService:
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
        taskName: taskData.taskName,
        taskDetails: taskData.taskDetails,
        comments: taskData.comments,
        status: taskData.status, // Add this
        priority: taskData.priority, // Add this
        statusStr: taskData.status, // Keep existing
        priorityStr: taskData.priority, // Keep existing
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        time: taskData.endTime,
      },
    };

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
      taskDetails: st.taskDetails,
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
        taskDetails: subTaskData.taskDetails,
        comments: subTaskData.comments,
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for table
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("All");
  const [inSearchMode, setInSearchMode] = useState(false);

  // State for sorting
  const [order, setOrder] = useState<SortDirection>("asc");
  const [orderBy, setOrderBy] = useState<SortField>("startTime");

  // State for filtering
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  // State for task form
  const [openForm, setOpenForm] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TaskForm>({
    taskName: "",
    taskDetails: "",
    comments: "",
    status: "Pending",
    priority: "Moderate",
    startTime: nowISO,
    endTime: nowISO,
    subTasks: [],
    completed: false,
  });

  // state for expanded tasks
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());



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
  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // First filter by tab
    let result = tasks;
    if (selectedStatusTab !== "All") {
      result = result.filter((task) => task.status === selectedStatusTab);
    }

    // Then apply additional filters
    if (monthFilter) {
      const [year, month] = monthFilter.split('-');
      result = result.filter((task) => {
        const taskDate = new Date(task.startTime);
        return taskDate.getFullYear() === parseInt(year) && 
               taskDate.getMonth() === parseInt(month) - 1;
      });
    } else {
      // Show current month by default when no month filter is selected
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      result = result.filter((task) => {
        const taskDate = new Date(task.startTime);
        return taskDate.getFullYear() === currentYear && 
               taskDate.getMonth() === currentMonth;
      });
    }

    if (statusFilter) {
      result = result.filter((task) => task.status === statusFilter);
    }

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
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
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
      setError("You can only update your own tasks");
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

      setSuccess("Status updated successfully");
    } catch (err) {
      setError("Failed to update status");
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
      setError("You can only update your own tasks");
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

      setSuccess("Priority updated successfully");
    } catch (err) {
      setError("Failed to update priority");
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

      for (const taskGroup of Object.values(response.tasks)) {
        for (const apiTask of taskGroup) {
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

          transformedTasks.push(convertApiTaskToLocal(apiTask));
        }
      }

      setTasks(transformedTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleFormChange = (field: keyof TaskForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Subtask helpers
  const addSubTask = () => {
    // Create a new subtask with default values
    const newSubTask: SubTaskForm = {
      id: generateId(),
      taskName: "",
      taskDetails: "",
      comments: "",
      status: "Pending",
      priority: "Moderate",
      startTime: nowISO,
      endTime: nowISO,
      completed: false,
    };

    // Add the new subtask to the form data
    setFormData((prev) => ({
      ...prev,
      subTasks: [...prev.subTasks, newSubTask],
    }));

    console.log("Added new subtask:", newSubTask);
  };

  const updateSubTask = (id: string, field: keyof SubTaskForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      subTasks: prev.subTasks.map((st) =>
        st.id === id ? { ...st, [field]: value } : st
      ),
    }));
  };

  const removeSubTask = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subTasks: prev.subTasks.filter((st) => st.id !== id),
    }));
  };

  // Open form for new task
  const handleOpenNew = () => {
    setFormData({
      taskName: "",
      taskDetails: "",
      comments: "",
      status: "Pending",
      priority: "Moderate",
      startTime: nowISO,
      endTime: nowISO,
      subTasks: [],
      completed: false,
    });
    setEditTaskId(null);
    setOpenForm(true);
  };

  // Open form for edit
  const handleOpenEdit = (task: Task) => {
    const mappedSubTasks: SubTaskForm[] = task.subTasks.map((st) => ({
      id: st.id,
      apiSubTaskId: st.apiSubTaskId,
      taskName: st.taskName,
      taskDetails: st.taskDetails,
      comments: st.comments || "",
      status: st.status,
      priority: st.priority,
      startTime: timestampToISO(st.startTime),
      endTime: timestampToISO(st.endTime),
      completed: st.completed,
    }));

    setFormData({
      taskName: task.taskName,
      taskDetails: task.taskDetails,
      comments: task.comments || "",
      status: task.status,
      priority: task.priority,
      startTime: timestampToISO(task.startTime),
      endTime: timestampToISO(task.endTime),
      subTasks: mappedSubTasks,
      completed: task.completed,
    });
    setEditTaskId(task.id);
    setOpenForm(true);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.taskName.trim()) {
      setError("Task Name is required");
      return false;
    }
    if (!formData.taskDetails.trim()) {
      setError("Task Details are required");
      return false;
    }
    if (isoToTimestamp(formData.endTime) < isoToTimestamp(formData.startTime)) {
      setError("End time must be after start time");
      return false;
    }

    // Validate each subtask
    for (let i = 0; i < formData.subTasks.length; i++) {
      const st = formData.subTasks[i];
      if (!st.taskName.trim()) {
        setError(`Subtask ${i + 1}: Name is required`);
        return false;
      }
      if (!st.taskDetails.trim()) {
        setError(`Subtask ${i + 1}: Details are required`);
        return false;
      }
      if (isoToTimestamp(st.endTime) < isoToTimestamp(st.startTime)) {
        setError(`Subtask ${i + 1}: End time must be after start time`);
        return false;
      }
      // Ensure status and priority are set
      if (!st.status) {
        setError(`Subtask ${i + 1}: Status is required`);
        return false;
      }
      if (!st.priority) {
        setError(`Subtask ${i + 1}: Priority is required`);
        return false;
      }
    }

    return true;
  };

  // Handle form submit (create or update)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (editTaskId) {
        // Update existing task
        const task = tasks.find((t) => t.id === editTaskId);
        if (!task || !task.apiTaskId) {
          throw new Error("Could not find task to update");
        }

        // Update main task
        await apiService.updateTask(task.apiTaskId, userId, {
          taskName: formData.taskName.trim(),
          taskDetails: formData.taskDetails.trim(),
          comments: formData.comments?.trim() || "",
          status: formData.status,
          priority: formData.priority,
          startTime: isoToTimestamp(formData.startTime),
          endTime: isoToTimestamp(formData.endTime),
        });

        // Handle subtasks
        // New subtasks to create
        const newSubTasks = formData.subTasks.filter((st) => !st.apiSubTaskId);
        if (newSubTasks.length > 0) {
          try {
            await apiService.addSubTasks(
              task.apiTaskId,
              userId,
              newSubTasks.map((st) => ({
                taskName: st.taskName.trim(),
                taskDetails: st.taskDetails.trim(),
                comments: st.comments?.trim() || "",
                status: st.status,
                priority: st.priority,
                startTime: isoToTimestamp(st.startTime),
                endTime: isoToTimestamp(st.endTime),
              }))
            );
          } catch (subTaskError) {
            console.error("Error adding subtasks:", subTaskError);
            setError(
              `Error adding subtasks: ${
                subTaskError instanceof Error
                  ? subTaskError.message
                  : "Unknown error"
              }`
            );
          }
        }

        // Update existing subtasks
        for (const st of formData.subTasks) {
          if (st.apiSubTaskId) {
            try {
              await apiService.updateSubTask(st.apiSubTaskId, userId, {
                taskId: task.apiTaskId,
                taskName: st.taskName.trim(),
                taskDetails: st.taskDetails.trim(),
                comments: st.comments?.trim() || "",
                status: st.status,
                priority: st.priority,
                startTime: isoToTimestamp(st.startTime),
                endTime: isoToTimestamp(st.endTime),
              });
            } catch (updateError) {
              console.error(
                `Error updating subtask ${st.apiSubTaskId}:`,
                updateError
              );
            }
          }
        }

        // Delete removed subtasks
        const currentSubTaskIds = new Set(
          formData.subTasks
            .filter((st) => st.apiSubTaskId)
            .map((st) => st.apiSubTaskId)
        );

        const removedSubTasks = task.subTasks.filter(
          (st) => st.apiSubTaskId && !currentSubTaskIds.has(st.apiSubTaskId)
        );

        for (const st of removedSubTasks) {
          if (st.apiSubTaskId) {
            try {
              await apiService.deleteSubTask(
                st.apiSubTaskId,
                userId,
                task.apiTaskId
              );
            } catch (deleteError) {
              console.error(
                `Error deleting subtask ${st.apiSubTaskId}:`,
                deleteError
              );
            }
          }
        }

        setSuccess("Task updated successfully");
      } else {
        // Create new task
        try {
          // First create the task without subtasks
          const mainTaskPayload = {
            taskName: formData.taskName.trim(),
            taskDetails: formData.taskDetails.trim(),
            comments: formData.comments?.trim() || "",
            status: formData.status,
            priority: formData.priority,
            startTime: isoToTimestamp(formData.startTime),
            endTime: isoToTimestamp(formData.endTime),
            // Empty subtasks array initially
            subTasks: [],
          };

          // Create the main task first
          const createdTask = await apiService.createTask(
            userId,
            mainTaskPayload
          );

          // If there are subtasks, add them separately
          if (formData.subTasks.length > 0) {
            try {
              const subtasksPayload = formData.subTasks.map((st) => ({
                taskName: st.taskName.trim(),
                taskDetails: st.taskDetails.trim(),
                comments: st.comments?.trim() || "",
                status: st.status,
                priority: st.priority,
                startTime: isoToTimestamp(st.startTime),
                endTime: isoToTimestamp(st.endTime),
              }));

              await apiService.addSubTasks(
                createdTask.taskId,
                userId,
                subtasksPayload
              );
            } catch (subtaskError) {
              console.error("Error adding subtasks to new task:", subtaskError);
              // Continue even if subtasks fail - we already have the main task
            }
          }

          setSuccess("Task created successfully");
        } catch (createError) {
          console.error("Error creating task:", createError);
          setError(
            `Error creating task: ${
              createError instanceof Error
                ? createError.message
                : "Unknown error"
            }`
          );
          setLoading(false);
          return; // Don't close the form if there was an error
        }
      }

      // Reload tasks and reset form
      await refreshHandler();
      setOpenForm(false);
    } catch (err) {
      console.error("Operation failed:", err);
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.apiTaskId) return;

    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setLoading(true);
    try {
      await apiService.deleteTask(task.apiTaskId, userId);
      setSuccess("Task deleted successfully");
      await refreshHandler();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  // Delete selected tasks
  const handleDeleteSelected = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} tasks?`
      )
    )
      return;

    setLoading(true);
    try {
      for (const id of selected) {
        const task = tasks.find((t) => t.id === id);
        if (task?.apiTaskId) {
          await apiService.deleteTask(task.apiTaskId, userId);
        }
      }
      setSuccess(`${selected.length} tasks deleted successfully`);
      setSelected([]);
      await refreshHandler();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tasks");
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    refreshHandler();
  }, []);

  // Update search mode when filters change
  useEffect(() => {
    setInSearchMode(
      monthFilter !== "" ||
        statusFilter !== "" ||
        priorityFilter !== "" ||
        userFilter !== "" ||
        dayFilter !== "" ||
        selectedStatusTab !== "All"
    );
  }, [
    monthFilter,
    statusFilter,
    priorityFilter,
    userFilter,
    dayFilter,
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
          />
        </Suspense>
        <Divider />
        <CardContent>
          <Stack direction="row" justifyContent="space-between">
            <Stack spacing={2} direction="row">
              <Suspense fallback={<MyCircularProgress />}>
                <TaskMonthFilter value={monthFilter} onChange={setMonthFilter} />
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
              </Suspense>
              {inSearchMode && (
                <Button variant="text" onClick={resetSearchParams}>
                  Clear Filters
                </Button>
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenNew}
                size="small"
              ></Button>

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

          {selected.length > 0 && (
            <Box mt={2}>
              <Stack spacing={2} direction="row" alignItems="center">
                <Typography variant="subtitle1">
                  {selected.length} Selected
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                  onClick={handleDeleteSelected}
                >
                  Delete Selected
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
        <Divider />

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
                    height: '4px',
                    width: '4px',
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
                  size={dense ? "small" : "medium"}
                  sx={{ width: "100%", tableLayout: "auto", minWidth: 800 }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ width: "50px" }}>
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
                      <TableCell sx={{ minWidth: "300px", width: "40%" }}>
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
                      <TableCell sx={{ minWidth: "250px" }}>Notes</TableCell>
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
                              sx={{ maxWidth: "80px" }}
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
                                <Box sx={{ width: 42, height: 42 }} />
                              )}
                            </TableCell>
                            <TableCell sx={{ minWidth: "300px", width: "40%" }}>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {task.subTasks.length > 0 && (
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleTaskExpansion(task.id)}
                                    sx={{ mr: 1, p: 0.5 }}
                                  >
                                    {expandedTasks.has(task.id) ? (
                                      <ExpandMore sx={{ fontSize: 16 }} />
                                    ) : (
                                      <ChevronRight sx={{ fontSize: 16 }} />
                                    )}
                                  </IconButton>
                                )}
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {task.taskName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {task.taskDetails}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Collapsible subtasks */}
                              {task.subTasks.length > 0 &&
                                expandedTasks.has(task.id) && (
                                  <Box
                                    sx={{
                                      mt: 1,
                                      ml: 1,
                                      borderLeft: "2px solid",
                                      borderColor: "divider",
                                      pl: 1,
                                    }}
                                  >
                                    {task.subTasks.map((subtask) => (
                                      <Box key={subtask.id} sx={{ py: 0.5 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{ fontWeight: 500 }}
                                        >
                                          • {subtask.taskName}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {subtask.taskDetails}
                                        </Typography>
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
                              {task.userId === userId ? (
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
                              {task.userId === userId ? (
                                <InlinePrioritySelect
                                  value={task.priority}
                                  taskId={task.id}
                                  onUpdate={handlePriorityUpdate}
                                />
                              ) : (
                                <TaskPriorityChip priority={task.priority} />
                              )}
                            </TableCell>
                            <TableCell sx={{ minWidth: "250px", width: "30%" }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "normal",
                                  wordWrap: "break-word",
                                  maxHeight: "100px",
                                  overflow: "auto",
                                }}
                              >
                                {task.comments || task.taskDetails}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ maxWidth: "80px" }}>
                              {task.userId === userId ? (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      color="primary"
                                      onClick={() => handleOpenEdit(task)}
                                      size="small"
                                    >
                                      <Edit
                                        sx={{ width: "18px", height: "18px" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDeleteTask(task.id)}
                                      size="small"
                                    >
                                      <Delete
                                        sx={{ width: "18px", height: "18px" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
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
              No tasks found. Click "New Task" to create one.
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

      {/* Task Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => !loading && setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editTaskId ? "Edit Task" : "New Task"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Task Name"
              value={formData.taskName}
              onChange={(e) => handleFormChange("taskName", e.target.value)}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Task Details"
              value={formData.taskDetails}
              onChange={(e) => handleFormChange("taskDetails", e.target.value)}
              multiline
              rows={3}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Comments"
              value={formData.comments}
              onChange={(e) => handleFormChange("comments", e.target.value)}
              multiline
              rows={2}
              fullWidth
              disabled={loading}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  label="Status"
                >
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
                  value={formData.priority}
                  onChange={(e) => handleFormChange("priority", e.target.value)}
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
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Start Time"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleFormChange("startTime", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
              <TextField
                label="End Time"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleFormChange("endTime", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Box>

            {/* Subtasks section */}
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Subtasks</Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addSubTask}
                  variant="outlined"
                  size="small"
                  disabled={loading}
                >
                  Add Subtask
                </Button>
              </Box>

              {formData.subTasks.map((subTask, index) => (
                <Card key={subTask.id} sx={{ mb: 2, p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1">
                      Subtask {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeSubTask(subTask.id)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      label="Subtask Name"
                      value={subTask.taskName}
                      onChange={(e) =>
                        updateSubTask(subTask.id, "taskName", e.target.value)
                      }
                      fullWidth
                      size="small"
                      disabled={loading}
                    />
                    <TextField
                      label="Subtask Details"
                      value={subTask.taskDetails}
                      onChange={(e) =>
                        updateSubTask(subTask.id, "taskDetails", e.target.value)
                      }
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
                      disabled={loading}
                    />
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <FormControl fullWidth size="small" disabled={loading}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={subTask.status}
                          onChange={(e) =>
                            updateSubTask(subTask.id, "status", e.target.value)
                          }
                          label="Status"
                        >
                          {TASK_STATUSES.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small" disabled={loading}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={subTask.priority}
                          onChange={(e) =>
                            updateSubTask(
                              subTask.id,
                              "priority",
                              e.target.value
                            )
                          }
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
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        label="Start Time"
                        type="datetime-local"
                        value={subTask.startTime}
                        onChange={(e) =>
                          updateSubTask(subTask.id, "startTime", e.target.value)
                        }
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        disabled={loading}
                      />
                      <TextField
                        label="End Time"
                        type="datetime-local"
                        value={subTask.endTime}
                        onChange={(e) =>
                          updateSubTask(subTask.id, "endTime", e.target.value)
                        }
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        disabled={loading}
                      />
                    </Box>
                  </Box>
                </Card>
              ))}

              {formData.subTasks.length === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No subtasks added yet
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading}
          >
            {editTaskId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskManager;
