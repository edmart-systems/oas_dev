// src/components/dashboard/tasks/TaskManager.tsx

"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Tooltip from "@mui/material/Tooltip";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Chip,
  Skeleton,
  Tabs,
  Tab,
  Avatar,
  Menu,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Save,
  Refresh,
  ArrowDropDown,
  ExpandMore,
  ChevronRight,
} from "@mui/icons-material";

type TaskStatus =
  | "Pending"
  | "In-Progress"
  | "Stalled"
  | "Failed"
  | "Done"
  | "Completed";
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
  details: {
    from: number;
    to: number;
  };
  tasks: Record<string, ApiTask[]>;
}

interface SubTask {
  id: string;
  apiSubTaskId?: number;
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
  id: string;
  apiTaskId?: number;
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
  id: string;
  apiSubTaskId?: number;
  taskName: string;
  taskDetails: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string;
  endTime: string;
  completed: boolean;
}

interface TaskForm {
  taskName: string;
  taskDetails: string;
  comments?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string;
  endTime: string;
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

function getWeekOfMonth(date: Date): string {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const dayOffset = firstDayOfMonth.getDay();
  const weekNumber = Math.ceil((dayOfMonth + dayOffset) / 7);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return `${weekNumber}${getOrdinalSuffix(weekNumber)} week of ${monthNames[date.getMonth()]}`;
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

const MyCircularProgress = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

const TaskStatusChip = ({ status }: { status: TaskStatus }) => {
  const getColor = () => {
    switch (status) {
      case "Completed":
      case "Done":
        return "success";
      case "In-Progress":
        return "info";
      case "Pending":
        return "warning";
      case "Stalled":
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

const TaskPriorityChip = ({ priority }: { priority: TaskPriority }) => {
  const getColor = () => {
    switch (priority) {
      case "Urgent": return "error";
      case "High": return "warning";
      case "Moderate": return "info";
      case "Low": return "success";
      default: return "default";
    }
  };

  return <Chip label={priority} color={getColor() as any} size="small" />;
};

export default TaskManager;