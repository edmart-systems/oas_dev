# TaskManager System - Comprehensive Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Component Analysis](#component-analysis)
5. [API Layer](#api-layer)
6. [Database Schema](#database-schema)
7. [Business Logic](#business-logic)
8. [Code Line-by-Line Analysis](#code-line-by-line-analysis)

## System Overview

The TaskManager is a comprehensive task management system built with Next.js, React, TypeScript, and Prisma. It provides functionality for creating, managing, tracking, and organizing tasks with subtasks, priorities, statuses, and user assignments.

### Key Features
- Multi-user task management
- Hierarchical task structure (tasks with subtasks)
- Status tracking (Pending, In-Progress, Stalled, Failed, Done, Completed, Cancelled)
- Priority levels (Urgent, High, Moderate, Low)
- Task pushing/rescheduling logic
- Time-based task organization
- Filtering and sorting capabilities
- Bulk operations
- Real-time updates

## Architecture

```
Frontend (React/TypeScript)
├── TaskManager.tsx (Main Component)
├── UI Components (MUI)
└── State Management (React Hooks)

API Layer (Next.js API Routes)
├── /api/tasks/* (CRUD Operations)
├── /api/tasks/expire (Legacy expired task handling)
└── /api/tasks/push-pending (New pending task pushing)

Business Logic Layer
├── TasksService (Business rules)
├── TasksRepository (Data access)
└── Task Methods (Validation)

Database Layer (Prisma + PostgreSQL)
├── Task Table
├── Sub_task Table
├── Task_status Table
├── Task_priority Table
└── User Table
```

## File Structure

### Core Files
```
src/components/dashboard/tasks/
└── TaskManager.tsx                 # Main component (2,649 lines)

src/app/api/tasks/
├── route.ts                        # Main tasks API
├── [taskId]/route.ts              # Individual task operations
├── subtasks/route.ts              # Subtask operations
├── expire/route.ts                # Legacy expired task handling
└── push-pending/route.ts          # New pending task pushing

src/services/tasks-service/
├── tasks.service.ts               # Business logic layer
├── tasks.repository.ts            # Data access layer
└── task-methods.ts                # Validation methods

src/types/
└── tasks.types.ts                 # TypeScript interfaces
```

## Component Analysis

### TaskManager.tsx - Main Component Structure

#### 1. Imports and Dependencies (Lines 1-20)
```typescript
"use client";                                    // Next.js client component directive
import React, { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { toast } from "react-toastify";         // Toast notifications
// MUI imports for UI components
// Phosphor icons for modern iconography
```

#### 2. Type Definitions (Lines 21-170)
```typescript
type TaskStatus = "Pending" | "In-Progress" | "Stalled" | "Failed" | "Done" | "Completed" | "Cancelled";
type TaskPriority = "Urgent" | "High" | "Moderate" | "Low";
type SortDirection = "asc" | "desc";
type SortField = "taskName" | "startTime" | "priority" | "status" | "user";
```

**Purpose**: Define strict typing for task properties ensuring type safety throughout the application.

#### 3. Interface Definitions (Lines 25-170)

##### ApiSubTask Interface (Lines 25-45)
```typescript
interface ApiSubTask {
  subTaskId: number;        // Unique identifier from database
  taskId: number;          // Parent task reference
  statusId: number;        // Foreign key to task_status table
  priorityId?: number;     // Optional foreign key to task_priority table
  taskName: string;        // Subtask title
  taskDetails?: string;    // Optional description
  comments?: string;       // Optional user comments
  status: {               // Nested status object
    id: number;
    status: TaskStatus;
  };
  startTime: number;      // Unix timestamp
  endTime: number;        // Unix timestamp
  time: number;           // Creation timestamp
  priority?: {            // Optional nested priority object
    id: number;
    priority: TaskPriority;
  };
}
```

**Purpose**: Defines the structure of subtask data as received from the API, including nested relationships.

##### ApiTask Interface (Lines 47-85)
```typescript
interface ApiTask {
  taskId: number;          // Unique identifier
  userId: number;          // Task owner
  statusId: number;        // Status foreign key
  priorityId: number;      // Priority foreign key
  taskName: string;        // Task title
  taskDetails?: string;    // Optional description
  comments?: string;       // Optional comments
  taskLocked: boolean;     // Prevents editing (for failed tasks)
  deleted: number;         // Soft delete flag (0/1)
  push_count: number;      // Number of times task was pushed/rescheduled
  archived: number;        // Archive flag (0/1)
  archived_at?: string;    // Archive timestamp
  status: {               // Nested status object
    id: number;
    status: TaskStatus;
  };
  startTime: number;      // Task start time (Unix timestamp)
  endTime: number;        // Task deadline (Unix timestamp)
  time: number;           // Creation timestamp
  priority: {             // Nested priority object
    id: number;
    priority: TaskPriority;
  };
  subTasks: ApiSubTask[]; // Array of subtasks
  user: {                 // Task owner information
    co_user_id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
```

**Purpose**: Defines the complete structure of task data from the API, including all relationships and metadata.

#### 4. Constants and Utility Functions (Lines 171-250)

##### Time Zone Handling (Lines 180-190)
```typescript
const now = new Date();
const ugandaNow = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // UTC+3 for Uganda
const nowISO = ugandaNow.getFullYear() + '-' + 
  String(ugandaNow.getMonth() + 1).padStart(2, '0') + '-' + 
  String(ugandaNow.getDate()).padStart(2, '0') + 'T08:00';
```

**Purpose**: Handles timezone conversion for Uganda (UTC+3) and creates standardized time strings for form inputs.

##### Utility Functions (Lines 195-250)
```typescript
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

function getWeekOfMonth(date: Date): string {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const weekNumber = Math.ceil(dayOfMonth / 7);
  
  const monthNames = ["January", "February", /* ... */];
  return `${weekNumber}${getOrdinalSuffix(weekNumber)} week of ${monthNames[date.getMonth()]}`;
}
```

**Purpose**: 
- `isoToTimestamp`: Converts ISO date strings to Unix timestamps for API communication
- `timestampToISO`: Converts Unix timestamps to ISO strings for form inputs
- `generateId`: Creates unique client-side IDs for new items
- `getWeekOfMonth`: Groups tasks by week for hierarchical display

#### 5. UI Components (Lines 251-450)

##### Loading Component (Lines 251-255)
```typescript
const MyCircularProgress = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
    <CircularProgress size={24} />
  </Box>
);
```

**Purpose**: Reusable loading indicator with consistent styling.

##### Status and Priority Chips (Lines 256-320)
```typescript
const TaskStatusChip = ({ status }: { status: TaskStatus }) => {
  const getColor = () => {
    switch (status) {
      case "Completed": return "success";
      case "Done": return "success";
      case "In-Progress": return "info";
      case "Pending": return "warning";
      case "Stalled": return "error";
      case "Failed": return "error";
      case "Cancelled": return "error";
      default: return "default";
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
```

**Purpose**: Visual representation of task status with color coding for quick identification.

##### Interactive Status Selector (Lines 321-450)
```typescript
const InlineStatusSelect = ({ value, taskId, onUpdate }: {
  value: TaskStatus;
  taskId: string;
  onUpdate: (taskId: string, status: TaskStatus) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  return (
    <>
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {value}
            <ArrowDropDown sx={{ fontSize: 16 }} />
          </Box>
        }
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ cursor: "pointer" }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {TASK_STATUSES.map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              onUpdate(taskId, status);
              setAnchorEl(null);
            }}
          >
            <Chip label={status} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
```

**Purpose**: Allows inline editing of task status through a dropdown menu, providing immediate visual feedback.

#### 6. Main Component State Management (Lines 600-700)

```typescript
export const TaskManager: React.FC<TaskManagerProps> = ({
  userId,
  apiBaseUrl = "/api",
}) => {
  // Core data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Table state
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("All");

  // Sorting state
  const [order, setOrder] = useState<SortDirection>("desc");
  const [orderBy, setOrderBy] = useState<SortField>("startTime");

  // Filtering state
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [taskNameFilter, setTaskNameFilter] = useState("");

  // UI state
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Dialog state
  const [openMultiAdd, setOpenMultiAdd] = useState(false);
  const [openMultiEdit, setOpenMultiEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form state
  const [multiTaskData, setMultiTaskData] = useState<TaskForm[]>([]);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
```

**Purpose**: Manages all component state including data, UI state, filtering, sorting, and form state.

#### 7. API Service Class (Lines 700-900)

```typescript
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
          errorData = { message: response.statusText };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getCurrentMonthTasks(): Promise<TasksResponse> {
    const timestamp = Date.now();
    const response = await this.makeRequest<TasksResponse>(`/tasks?t=${timestamp}`);
    return response.data;
  }

  async createTask(userId: number, taskData: any): Promise<ApiTask> {
    const payload = { userId, newTask: taskData };
    const response = await this.makeRequest<ApiTask>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  async updateTask(taskId: number, userId: number, taskData: any): Promise<ApiTask> {
    const payload = { userId, taskData: { userId, taskId, ...taskData } };
    const response = await this.makeRequest<ApiTask>(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  }
}
```

**Purpose**: Encapsulates all API communication with proper error handling, request formatting, and response parsing.

#### 8. Data Processing and Filtering (Lines 900-1200)

##### Status Counts Calculation (Lines 900-910)
```typescript
const statusCounts = useMemo(() => {
  return tasks.reduce((counts, task) => {
    const status = task.status;
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {} as Record<TaskStatus, number>);
}, [tasks]);
```

**Purpose**: Calculates task counts by status for tab display, recalculated when tasks change.

##### Filtering and Sorting Logic (Lines 920-1100)
```typescript
const filteredAndSortedTasks = useMemo(() => {
  let result = tasks;
  
  // Status filtering
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
      result = result.filter((task) => task.status !== "Cancelled");
    }
  }

  // Month filtering
  if (monthFilter) {
    const [year, month] = monthFilter.split('-');
    result = result.filter((task) => {
      const taskDate = new Date(task.startTime);
      return taskDate.getFullYear() === parseInt(year) && 
             taskDate.getMonth() === parseInt(month) - 1;
    });
  }

  // Priority filtering
  if (priorityFilter) {
    result = result.filter((task) => task.priority === priorityFilter);
  }

  // User filtering
  if (userFilter) {
    result = result.filter((task) => {
      if (!task.user) return false;
      const fullName = `${task.user.firstName} ${task.user.lastName}`;
      return fullName === userFilter;
    });
  }

  // Sorting
  result = [...result].sort((a, b) => {
    const isAsc = order === "asc";
    switch (orderBy) {
      case "taskName":
        return isAsc ? a.taskName.localeCompare(b.taskName) : b.taskName.localeCompare(a.taskName);
      case "status":
        return isAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      case "priority": {
        const priorityOrder = { Urgent: 0, High: 1, Moderate: 2, Low: 3 };
        return isAsc 
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      case "startTime":
        return isAsc ? a.startTime - b.startTime : b.startTime - a.startTime;
      default:
        return 0;
    }
  });

  return result;
}, [tasks, selectedStatusTab, monthFilter, statusFilter, priorityFilter, userFilter, order, orderBy]);
```

**Purpose**: Implements comprehensive filtering and sorting logic with memoization for performance.

##### Task Grouping (Lines 1100-1150)
```typescript
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
```

**Purpose**: Groups filtered tasks by week for hierarchical display in the UI.

#### 9. Event Handlers (Lines 1200-1800)

##### Status Update Handler (Lines 1200-1250)
```typescript
const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
  const task = tasks.find((t) => t.id === taskId);
  if (!task?.apiTaskId) return;
  
  // Authorization check
  if (task.userId !== userId) {
    toast("You can only update your own tasks", { type: "error" });
    return;
  }

  try {
    await apiService.updateTask(task.apiTaskId, userId, {
      statusStr: newStatus,
    });

    // Update local state
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    if (newStatus === "Failed") {
      toast("Task marked as failed", { type: "info" });
    } else {
      if (newStatus !== "Cancelled" && newStatus !== "Pending") {
        toast("Status updated successfully", { type: "success" });
      }
    }
  } catch (err) {
    toast("Failed to update status", { type: "error" });
  }
};
```

**Purpose**: Handles task status updates with authorization checks, API calls, and local state updates.

##### Data Refresh Handler (Lines 1400-1500)
```typescript
const refreshHandler = async () => {
  setLoading(true);
  try {
    const startOf2024 = new Date('2024-01-01').getTime();
    const endOf2026 = new Date('2026-12-31').getTime();
    
    const response = await apiService.getTasksInRange(
      startOf2024,
      endOf2026,
      0 // Use 0 to get all users' tasks
    );
    
    const transformedTasks: Task[] = [];
    let currentUserName = "";

    for (const taskGroup of Object.values(response.tasks)) {
      for (const apiTask of taskGroup) {
        // Add fallback user data if missing
        if (!apiTask.user) {
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
        transformedTasks.push(localTask);
      }
    }

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
```

**Purpose**: Fetches and processes task data from the API, handles data transformation, and sets up default filtering.

#### 10. Task Creation and Editing (Lines 1600-1900)

##### Multi-Task Creation Handler (Lines 1700-1850)
```typescript
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
            .filter(st => st.taskName.trim())
            .map(st => ({
              userId,
              taskId: 0,
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
    
    // Process pending tasks after creation
    try {
      await fetch('/api/tasks/push-pending', { method: 'POST' });
    } catch (err) {
      console.log('Failed to process pending tasks:', err);
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
```

**Purpose**: Handles creation and updating of multiple tasks with subtasks, including data validation and API communication.

#### 11. Component Lifecycle (Lines 1900-2000)

##### Initialization Effect (Lines 1950-1970)
```typescript
useEffect(() => {
  const initializeData = async () => {
    // Process pending/in-progress tasks for push logic first
    try {
      await fetch('/api/tasks/push-pending', { method: 'POST' });
    } catch (err) {
      console.log('Failed to process pending tasks on load:', err);
    }
    // Then load tasks
    await refreshHandler();
  };
  initializeData();
}, []);
```

**Purpose**: Initializes the component by processing pending tasks and loading data on mount.

#### 12. Render Logic (Lines 2000-2649)

##### Main Table Structure (Lines 2100-2500)
```typescript
{Object.entries(groupedTasks).map(([weekKey, weekTasks]) => (
  <Box key={weekKey} mb={5} sx={{ ml: 2 }}>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
      {weekKey}
    </Typography>

    <Card variant="outlined" sx={{ mb: 2, overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: "70vh", overflow: "auto", width: "100%" }}>
        <Table size="small" sx={{ width: "100%", tableLayout: "auto", minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={/* complex logic for partial selection */}
                  checked={/* complex logic for full selection */}
                  onChange={/* handle select all for week */}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "taskName"}
                  direction={orderBy === "taskName" ? order : "asc"}
                  onClick={() => handleRequestSort("taskName")}
                >
                  Task
                </TableSortLabel>
              </TableCell>
              {/* Additional sortable columns */}
            </TableRow>
          </TableHead>
          <TableBody>
            {weekTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task, index) => {
                const isItemSelected = selected.includes(task.id);
                
                return (
                  <TableRow key={task.id} selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      {task.userId === userId && task.status !== "Failed" ? (
                        <Checkbox
                          checked={isItemSelected}
                          onClick={(event) => handleSelectClick(event, task.id)}
                        />
                      ) : (
                        <Box sx={{ width: 14, height: 14 }} />
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {task.subTasks.length > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => toggleTaskExpansion(task.id)}
                          >
                            {expandedTasks.has(task.id) ? <ExpandMore /> : <ChevronRight />}
                          </IconButton>
                        )}
                        <Typography variant="subtitle2">
                          {task.taskName}{task.push_count > 0 && ` (x${task.push_count})`}
                        </Typography>
                      </Box>

                      {/* Collapsible subtasks */}
                      {task.subTasks.length > 0 && expandedTasks.has(task.id) && (
                        <Box sx={{ mt: 0.5, ml: 0.5, borderLeft: "1px solid", borderColor: "divider", pl: 0.5 }}>
                          {task.subTasks.map((subtask) => (
                            <Box key={subtask.id} sx={{ py: 0.25 }}>
                              <Typography variant="body2">• {subtask.taskName}</Typography>
                              {subtask.taskDetails && (
                                <Typography variant="caption" color="text.secondary">
                                  {subtask.taskDetails}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      <UserAvatar user={task.user} userId={task.userId} />
                    </TableCell>

                    <TableCell>
                      {task.userId === userId && task.status !== "Failed" ? (
                        <InlineStatusSelect
                          value={task.status}
                          taskId={task.id}
                          onUpdate={handleStatusUpdate}
                        />
                      ) : (
                        <TaskStatusChip status={task.status} />
                      )}
                    </TableCell>

                    {/* Additional cells for dates, priority, notes, actions */}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  </Box>
))}
```

**Purpose**: Renders the main task table with hierarchical grouping, expandable subtasks, inline editing, and conditional interactions based on user permissions and task status.

## API Layer

### Task API Endpoints

#### 1. Main Tasks API (`/api/tasks/route.ts`)
- **GET**: Fetch current month tasks
- **POST**: Create new task with subtasks

#### 2. Individual Task API (`/api/tasks/[taskId]/route.ts`)
- **PUT**: Update existing task
- **DELETE**: Soft delete task (mark as cancelled)

#### 3. Subtasks API (`/api/tasks/subtasks/route.ts`)
- **POST**: Add subtasks to existing task
- **PUT**: Update subtask (`/api/tasks/subtasks/[subTaskId]/route.ts`)
- **DELETE**: Delete subtask (`/api/tasks/subtasks/[subTaskId]/route.ts`)

#### 4. Task Processing APIs
- **POST `/api/tasks/expire`**: Legacy expired task handling (marks as failed, creates new tasks)
- **POST `/api/tasks/push-pending`**: New pending task pushing (updates existing tasks to current day)

## Database Schema

### Core Tables

#### Task Table
```sql
CREATE TABLE Task (
  taskId SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  statusId INTEGER NOT NULL,
  priorityId INTEGER NOT NULL,
  taskName VARCHAR(255) NOT NULL,
  taskDetails TEXT,
  comments TEXT,
  taskLocked INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  push_count INTEGER DEFAULT 0,
  archived INTEGER DEFAULT 0,
  archived_at TIMESTAMP,
  startTime BIGINT NOT NULL,
  endTime BIGINT NOT NULL,
  time BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES User(co_user_id),
  FOREIGN KEY (statusId) REFERENCES Task_status(id),
  FOREIGN KEY (priorityId) REFERENCES Task_priority(id)
);
```

#### Sub_task Table
```sql
CREATE TABLE Sub_task (
  subTaskId SERIAL PRIMARY KEY,
  taskId INTEGER NOT NULL,
  statusId INTEGER NOT NULL,
  priorityId INTEGER,
  taskName VARCHAR(255) NOT NULL,
  taskDetails TEXT,
  comments TEXT,
  startTime BIGINT NOT NULL,
  endTime BIGINT NOT NULL,
  time BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (taskId) REFERENCES Task(taskId) ON DELETE CASCADE,
  FOREIGN KEY (statusId) REFERENCES Task_status(id),
  FOREIGN KEY (priorityId) REFERENCES Task_priority(id)
);
```

#### Reference Tables
```sql
CREATE TABLE Task_status (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Task_priority (
  id SERIAL PRIMARY KEY,
  priority VARCHAR(50) NOT NULL UNIQUE
);
```

## Business Logic

### Task Lifecycle

1. **Creation**: Tasks created with default "Pending" status
2. **Processing**: Tasks can be updated to "In-Progress"
3. **Completion**: Tasks marked as "Done" or "Completed"
4. **Failure Handling**: 
   - Manual failure: Task marked as "Failed", no pushing
   - Automatic expiry: Legacy system marks as "Failed" and creates new task
5. **Pushing Logic**: Pending/In-Progress tasks updated to current day before deadline

### Push Count System

The `push_count` field tracks how many times a task has been rescheduled:
- Incremented each time a task is pushed to a new day
- Displayed in UI as "(x2)", "(x3)", etc.
- Used to find the highest count for task name variations
- Maintains continuity across task iterations

### Authorization Rules

1. **Task Ownership**: Users can only edit their own tasks
2. **Failed Task Restrictions**: 
   - Cannot be edited or deleted
   - No checkbox for selection
   - Status shows as read-only
3. **Admin Features**: Some operations available to all users (viewing others' tasks)

### Status-Based Behavior

- **Pending/In-Progress**: Can be edited, pushed to current day
- **Failed**: Read-only, cannot be selected or modified
- **Completed/Done**: Can be edited but not pushed
- **Cancelled**: Treated as "deleted", shown in separate tab

## Key Features Implementation

### 1. Hierarchical Task Display
Tasks are grouped by week using `getWeekOfMonth()` function, creating a hierarchical view that makes it easy to see task distribution over time.

### 2. Inline Editing
Status and priority can be changed directly in the table using dropdown menus, providing immediate feedback and reducing clicks.

### 3. Bulk Operations
Multiple tasks can be selected and operated on simultaneously (edit status/priority, delete).

### 4. Advanced Filtering
Multiple filter types can be combined:
- Month/date filtering
- Status filtering
- Priority filtering
- User filtering
- Text search

### 5. Subtask Management
Tasks can have multiple subtasks that inherit parent task properties and can be managed independently.

### 6. Push Logic
Two systems for handling task scheduling:
- Legacy: Expired tasks marked as failed, new tasks created
- New: Pending tasks updated to current day, maintaining continuity

This comprehensive system provides a robust task management solution with advanced features for team collaboration and task tracking.