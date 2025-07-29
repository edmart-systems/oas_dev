# TaskManager Component - Line by Line Documentation

## File Header and Imports (Lines 1-50)

```typescript
// src/components/dashboard/tasks/TaskManager.tsx
```

**Line 1**: File path comment indicating this is a TaskManager component in the dashboard tasks directory.

```typescript
"use client";
```

**Line 3**: Next.js directive indicating this is a client-side component (runs in browser, not server).

```typescript
import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
```

**Line 5**: Import React hooks and utilities:

- `useState`: For component state management
- `useEffect`: For side effects (API calls, subscriptions)
- `useRef`: For DOM references (unused in this component)
- `useMemo`: For performance optimization via memoization
- `Suspense`: For lazy loading components

```typescript
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
// ... more table imports
```

**Lines 6-16**: Import Material-UI table components for creating data tables.

```typescript
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
```

**Lines 17-32**: Import various Material-UI components:

- **Layout**: Box, Stack, Card, Divider
- **Forms**: TextField, FormControl, Select, Button
- **Feedback**: CircularProgress, Snackbar, Alert
- **Navigation**: Tabs, Tab
- **Data Display**: Typography, Chip, Avatar, Skeleton

```typescript
import {
  Add,
  Delete,
  Edit,
  Save,
  Refresh,
  Launch,
  Sort,
  ArrowDropDown,
  ExpandMore,
  ChevronRight,
} from "@mui/icons-material";
```

**Lines 33-38**: Import Material-UI icons for UI actions and indicators.

## Type Definitions (Lines 40-85)

```typescript
type TaskStatus =
  | "Pending"
  | "In-Progress"
  | "Stalled"
  | "Failed"
  | "Done"
  | "Completed";
```

**Line 40**: Union type defining all possible task status values.

```typescript
type TaskPriority = "Urgent" | "High" | "Moderate" | "Low";
```

**Line 41**: Union type defining task priority levels.

```typescript
type SortDirection = "asc" | "desc";
```

**Line 42**: Union type for table sorting direction.

```typescript
type SortField = "taskName" | "startTime" | "priority" | "status" | "user";
```

**Line 43**: Union type defining which fields can be sorted.

## API Response Interfaces (Lines 45-120)

```typescript
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
```

**Lines 45-65**: Interface defining the structure of subtask data from the API:

- Uses numeric IDs for backend references
- Nested objects for status and priority with both ID and string values
- Timestamps as numbers (Unix timestamps)
- Optional fields marked with `?`

```typescript
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
```

Interface defining the main task structure from API:

- Contains user information and array of subtasks
- Includes locking mechanism (`taskLocked`)
- Similar structure to ApiSubTask but with additional fields

```typescript
interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}
```

Generic wrapper interface for all API responses with standard format.

```typescript
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
```

Interface for the tasks endpoint response:

- Contains user lookup map
- Date range information
- Tasks grouped by some key (likely dates)

## Form Interfaces (Lines 115-200)

```typescript
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
```

**Lines 115-128**: Client-side subtask interface:

- Uses string IDs for new items, number IDs for existing
- Simplified structure compared to API version
- Added `completed` boolean for UI state

```typescript
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
```

Client-side task interface, similar to SubTask but for main tasks.

```typescript
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
```

Form-specific subtask interface:

- Uses ISO string dates for HTML datetime-local inputs
- Optimized for form handling

```typescript
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
```

Form-specific task interface for the create/edit dialog.

```typescript
interface TaskManagerProps {
  userId: number;
  apiBaseUrl?: string;
}
```

Props interface for the main TaskManager component.

## Constants and Utility Functions

```typescript
const TASK_STATUSES: TaskStatus[] = [
  "Pending",
  "In-Progress",
  "Stalled",
  "Failed",
  "Done",
  "Completed",
];
const TASK_PRIORITIES: TaskPriority[] = ["Urgent", "High", "Moderate", "Low"];
```

**Lines 184-189**: Arrays of valid status and priority values for dropdowns and validation.

```typescript
const nowISO = new Date().toISOString().slice(0, 16);
```

Current datetime as ISO string formatted for datetime-local inputs (removes seconds/milliseconds).

```typescript
function isoToTimestamp(iso: string): number {
  return new Date(iso).getTime();
}
```

Converts ISO datetime string to Unix timestamp.

```typescript
function timestampToISO(ts: number): string {
  return new Date(ts).toISOString().slice(0, 16);
}
```

**Lines 197-199**: Converts Unix timestamp to ISO string for form inputs.

```typescript
function generateId() {
  return Math.random().toString(36).slice(2);
}
```

Generates random string ID for new client-side items.

## Date Helper Functions

```typescript
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
```

Calculates which week of the month a date falls in:

- Gets first day of month to calculate offset
- Calculates week number accounting for partial first week
- Returns formatted string like "2nd week of July"

```typescript
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
```

Adds ordinal suffix (st, nd, rd, th) to numbers.

```typescript
function getDayLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);

  let dayLabel = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  if (taskDate.getTime() === today.getTime()) {
    dayLabel += " - Today";
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    dayLabel += " - Tomorrow";
  } else if (taskDate.getTime() === yesterday.getTime()) {
    dayLabel += " - Yesterday";
  }

  return dayLabel;
}
```

Creates human-readable date labels:

- Normalizes times to midnight for comparison
- Adds relative labels (Today, Tomorrow, Yesterday)
- Returns formatted date string

## UI Components

```typescript
const MyCircularProgress = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
    <CircularProgress size={24} />
  </Box>
);
```

Simple loading spinner component with consistent styling.

```typescript
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
```

Status chip component:

- Maps status values to Material-UI color variants
- Uses outlined variant for subtle appearance
- Small size for compact display

```typescript
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
```

**Lines 302-320**: Priority chip component with color mapping from urgent (red) to low (green).

## Interactive Components

```typescript
const InlineStatusSelect = ({
  value, taskId, onUpdate,
}: {
  value: TaskStatus;
  taskId: string;
  onUpdate: (taskId: string, status: TaskStatus) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
```

Inline status selector component:

- Takes current value and update callback
- Uses anchorEl state for dropdown positioning

```typescript
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
```

Color mapping function for the current status.

```typescript
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
```

Renders clickable chip that opens dropdown menu:

- Chip shows current status with dropdown arrow
- Menu contains all possible statuses as chips
- Calls onUpdate when status is selected
- Closes menu after selection

```typescript
const InlinePrioritySelect = ({
  value,
  taskId,
  onUpdate,
}: {
  value: TaskPriority;
  taskId: string;
  onUpdate: (taskId: string, priority: TaskPriority) => void;
}) => {
  // ... similar implementation to InlineStatusSelect
};
```

**Lines 396-450**: Similar inline selector for task priority with same pattern.

## User Avatar Component (Lines 452-490)

```typescript
const UserAvatar = ({
  user, userId,
}: {
  user?: { firstName: string; lastName: string; email: string };
  userId?: number;
}) => {
  // Default display for when user data is not available
  let initials = userId ? `U${userId}` : "U";
  let tooltipText = userId ? `User ${userId}` : "Unknown User";
```

**Lines 452-463**: Avatar component that handles missing user data gracefully.

```typescript
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
```

Logic to extract initials and build tooltip text from available user data.

```typescript
return (
  <Tooltip title={tooltipText}>
    <Avatar sx={{ width: 30, height: 30, fontSize: "0.8rem" }}>
      {initials}
    </Avatar>
  </Tooltip>
);
```

Renders small avatar with tooltip showing user information.

## Filter Components

```typescript
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
```

Tab component showing task counts by status:

- "All" tab shows total count
- Individual tabs for each status with counts
- Scrollable tabs for responsive design

```typescript
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
    // ... more months
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
```

Month filter dropdown:

- Empty value defaults to current month
- Hardcoded list of months for 2025
- Small size for compact layout

The remaining filter components (TaskStatusFilter, TaskPriorityFilter, TaskUserFilter, TaskDayFilter) follow similar patterns with different data sources.

## API Service Class

```typescript
class TaskApiService {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }
```

Service class for API communication with configurable base URL.

```typescript
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
```

Generic HTTP request method:

- Sets default JSON headers
- Handles HTTP errors and JSON parsing errors
- Logs errors and re-throws for caller handling
- Returns typed API response

```typescript
  async getCurrentMonthTasks(): Promise<TasksResponse> {
    const timestamp = Date.now();
    const response = await this.makeRequest<TasksResponse>(
      `/tasks?t=${timestamp}`
    );
    return response.data;
  }
```

Fetches current month tasks with cache-busting timestamp.

```typescript
  async createTask(userId: number, taskData: any): Promise<ApiTask> {
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
        time: st.endTime,
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
        time: taskData.endTime,
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
```

Creates new task:

- Processes subtasks to ensure required fields
- Wraps task data in expected API format
- Logs payload for debugging
- Returns created task data

The remaining API methods follow similar patterns for update, delete, and subtask operations.

## Helper Functions

```typescript
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
```

Converts API task format to client-side format:

- Converts numeric IDs to strings for client use
- Extracts status/priority from nested objects
- Maps subtasks recursively
- Derives completed boolean from status

## Main Component Declaration

```typescript
export const TaskManager: React.FC<TaskManagerProps> = ({
  userId,
  apiBaseUrl = "/api",
}) => {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
```

Component declaration and main state:

- tasks: Array of all loaded tasks
- loading: Boolean for async operation state
- error/success: Notification messages

```typescript
// State for table
const [selected, setSelected] = useState<string[]>([]);
const [page, setPage] = useState(0);
const [dense, setDense] = useState(false);
const [rowsPerPage, setRowsPerPage] = useState(30);
const [selectedStatusTab, setSelectedStatusTab] = useState<string>("All");
const [inSearchMode, setInSearchMode] = useState(false);
```

Table and UI state:

- selected: Array of selected task IDs for bulk operations
- Pagination state (page, rowsPerPage)
- Tab and search mode flags

```typescript
// State for sorting
const [order, setOrder] = useState<SortDirection>("asc");
const [orderBy, setOrderBy] = useState<SortField>("startTime");
```

Sorting state with default sort by start time ascending.

```typescript
// State for filtering
const [monthFilter, setMonthFilter] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [priorityFilter, setPriorityFilter] = useState("");
const [userFilter, setUserFilter] = useState("");
const [dayFilter, setDayFilter] = useState("");
```

Filter state for various task attributes.

```typescript
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
```

Form state:

- openForm: Controls dialog visibility
- editTaskId: Tracks which task is being edited (null for new)
- formData: Current form values with defaults

```typescript
// state for expanded tasks
const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
```

Set to track which tasks have expanded subtasks.

```typescript
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
```

Function to toggle task expansion state using Set operations.

```typescript
// API service
const apiService = useMemo(() => new TaskApiService(apiBaseUrl), [apiBaseUrl]);
```

Memoized API service instance to prevent recreation on every render.

## Computed Values (Lines 939-1100)

```typescript
// Calculate status counts
const statusCounts = useMemo(() => {
  return tasks.reduce((counts, task) => {
    const status = task.status;
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {} as Record<TaskStatus, number>);
}, [tasks]);
```

Memoized calculation of task counts by status for tab labels.

```typescript
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
```

Complex filtering logic:

- Starts with all tasks, applies filters sequentially
- Status tab filter first
- Month filter with current month default
- Date arithmetic to match year/month

```typescript
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


`if (userFilter)` - Only execute filtering if a user filter is applied
 `result = result.filter((task) => {` - Use JavaScript's filter method to create a new array containing only tasks that match our criteria
`if (!task.user) return false;` - If a task doesn't have user data, exclude it from results
`const fullName = \`${task.user.firstName} ${task.user.lastName}\`;` - Template literal to combine first and last names
- **Line 5**: `return fullName === userFilter;` - Return true (include task) if the full name matches the filter
- **Line 6**: `});` - Close the filter function
- **Line 7**: `}` - End the if statement

**Key Learning Points:**

- **Array.filter()**: Creates a new array with elements that pass a test
- **Template literals**: Use backticks (`) for string interpolation with ${}
- **Conditional returns**: Early return pattern for cleaner code

---

## Section 2: Day Filtering Logic (Lines 8-28)

```typescript
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
```

**Line-by-line breakdown:**

- **Line 9**: `const today = new Date();` - Create a new Date object for current date/time
- **Line 10**: `today.setHours(0, 0, 0, 0);` - Reset time to midnight for accurate date comparison
- **Line 12**: `const yesterday = new Date(today);` - Create yesterday's date by copying today
- **Line 13**: `yesterday.setDate(yesterday.getDate() - 1);` - Subtract one day
- **Line 16**: `const taskDate = new Date(task.startTime);` - Convert task's timestamp to Date object
- **Line 17**: `taskDate.setHours(0, 0, 0, 0);` - Reset task time to midnight
- **Line 19-20**: Compare timestamps using `getTime()` for "today" filter
- **Line 21-22**: Compare timestamps for "yesterday" filter
- **Line 24**: `return true;` - Default case: include all tasks if no specific day filter

**Key Learning Points:**

- **Date manipulation**: Working with JavaScript Date objects
- **Time normalization**: Setting hours to 0 for date-only comparisons
- **getTime()**: Returns milliseconds since epoch for precise comparison

---

## Section 3: Sorting Logic (Lines 30-60)

```javascript
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
      return isAsc ? aUser.localeCompare(bUser) : bUser.localeCompare(aUser);
    }
    default:
      return 0;
  }
});
```

**Line-by-line breakdown:**

- **Line 31**: `result = [...result].sort((a, b) => {` - Spread operator creates a copy before sorting (immutability)
- **Line 32**: `const isAsc = order === "asc";` - Boolean flag for ascending order
- **Line 34**: `switch (orderBy) {` - Switch statement to handle different sort fields
- **Line 36-38**: String sorting using `localeCompare()` for proper alphabetical order
- **Line 43**: `const priorityOrder = { Urgent: 0, High: 1, Moderate: 2, Low: 3 };` - Custom priority mapping
- **Line 44-46**: Numeric comparison using mapped priority values
- **Line 49**: Direct numeric comparison for timestamps
- **Line 51-52**: Safe user name extraction with fallback to empty string
- **Line 58**: `default: return 0;` - No sorting change for unknown fields

**Key Learning Points:**

- **Spread operator**: `[...array]` creates a shallow copy
- **Array.sort()**: Mutates original array, so we copy first
- **localeCompare()**: Proper string comparison respecting locale
- **Ternary operator**: Condition ? value1 : value2
- **Switch statements**: Clean way to handle multiple conditions

---

## Section 4: useMemo Dependencies (Lines 62-72)

```javascript
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
```

**Key Learning Points:**

- **useMemo dependencies**: Array of values that trigger recalculation when changed
- **Performance optimization**: Prevents unnecessary recalculations
- **Dependency tracking**: React compares each dependency for changes

---

## Section 5: Task Grouping Logic (Lines 74-87)

```javascript
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

**Line-by-line breakdown:**

- **Line 75**: `const weekGroups: Record<string, Task[]> = {};` - TypeScript type for object with string keys and Task array values
- **Line 77**: `filteredAndSortedTasks.forEach((task) => {` - Iterate through each task
- **Line 78-79**: Extract date and calculate week key using helper function
- **Line 81-83**: Initialize empty array if week key doesn't exist yet
- **Line 85**: `weekGroups[weekKey].push(task);` - Add task to appropriate week group

**Key Learning Points:**

- **Record<K, V>**: TypeScript utility type for object with known key/value types
- **forEach()**: Executes function for each array element
- **Dynamic object properties**: Using variables as object keys with bracket notation

---

## Section 6: Pagination Logic (Lines 89-102)

```javascript
const visibleRows = useMemo(() => {
  return filteredAndSortedTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
}, [filteredAndSortedTasks, page, rowsPerPage]);

const emptyRows =
  page > 0
    ? Math.max(0, (1 + page) * rowsPerPage - filteredAndSortedTasks.length)
    : 0;
```

**Line-by-line breakdown:**

- **Line 91-93**: `slice()` method to get subset of tasks for current page
- **Line 97-99**: Calculate empty rows for consistent table height
- **Math.max(0, ...)**: Ensures we never get negative empty rows

**Key Learning Points:**

- **Array.slice()**: Returns portion of array without modifying original
- **Pagination math**: (page \* itemsPerPage) for start index
- **Math.max()**: Returns largest of given numbers

---

## Section 7: Sort Handler (Lines 104-108)

```javascript
const handleRequestSort = (property: SortField) => {
  const isAsc = orderBy === property && order === "asc";
  setOrder(isAsc ? "desc" : "asc");
  setOrderBy(property);
};
```

**Key Learning Points:**

- **Toggle logic**: If currently ascending on this field, switch to descending
- **State updates**: Setting multiple related state values
- **Function parameters**: TypeScript ensures type safety

---

## Section 8: Select All Handler (Lines 110-119)

```javascript
const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.checked) {
    const newSelected = filteredAndSortedTasks.map((task) => task.id);
    setSelected(newSelected);
    return;
  }
  setSelected([]);
};
```

**Line-by-line breakdown:**

- **Line 111**: `if (event.target.checked)` - Check if checkbox was checked
- **Line 112**: `map()` to extract just the IDs from tasks
- **Line 115**: Early return pattern
- **Line 117**: Clear selection by setting empty array

**Key Learning Points:**

- **Event handling**: React synthetic events
- **Array.map()**: Transform array elements
- **Early returns**: Cleaner than if/else blocks

---

## Section 9: Individual Item Selection (Lines 121-138)

```javascript
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
```

**Line-by-line breakdown:**

- **Line 122**: `indexOf()` returns -1 if item not found
- **Line 125**: If not selected (-1), add to selection
- **Line 127**: If first item (index 0), remove it with `slice(1)`
- **Line 129**: If last item, remove with `slice(0, -1)`
- **Line 131-135**: If middle item, concatenate slices before and after

**Key Learning Points:**

- **indexOf()**: Finds position of element in array
- **Array.concat()**: Joins arrays together
- **Negative slice index**: -1 means "up to but not including last item"
- **Immutable updates**: Creating new arrays instead of modifying existing

---

## Section 10: Pagination Handlers (Lines 140-149)

```javascript
const handleChangePage = (event: unknown, newPage: number) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};
```

**Key Learning Points:**

- **parseInt()**: Converts string to integer, second parameter is radix (base 10)
- **Reset page**: When changing rows per page, go back to first page

---

## Section 11: Status Update Handler (Lines 151-172)

```javascript
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
```

**Line-by-line breakdown:**

- **Line 152**: `async` function for asynchronous operations
- **Line 153**: `find()` method to locate task by ID
- **Line 154**: Optional chaining (`?.`) - safe property access
- **Line 157-160**: Authorization check
- **Line 162-165**: API call wrapped in try/catch
- **Line 167-169**: Optimistic update - update local state immediately
- **Line 169**: Spread operator to create new object with updated status

**Key Learning Points:**

- **Async/await**: Modern JavaScript for handling promises
- **Optional chaining**: Safe property access with `?.`
- **Array.find()**: Returns first matching element
- **Try/catch**: Error handling for async operations
- **Optimistic updates**: Update UI before server confirms
- **Functional state updates**: Using callback with previous state

---

## Section 12: Priority Update Handler (Lines 174-195)

Similar structure to status update - demonstrates consistent pattern for CRUD operations.

---

## Section 13: Reset Search Parameters (Lines 197-205)

```javascript
const resetSearchParams = () => {
  setInSearchMode(false);
  setSelectedStatusTab("All");
  setMonthFilter("");
  setStatusFilter("");
  setPriorityFilter("");
  setUserFilter("");
  setDayFilter("");
};
```

**Key Learning Points:**

- **Multiple state updates**: Resetting all filter states at once
- **Default values**: Returning to initial state

---

## Section 14: Refresh Handler (Lines 207-244)

```javascript
const refreshHandler = async () => {
  setLoading(true);
  try {
    // Load all tasks from 2024-2026 range so month filtering works
    const startOf2024 = new Date("2024-01-01").getTime();
    const endOf2026 = new Date("2026-12-31").getTime();

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
```

**Line-by-line breakdown:**

- **Line 208**: Set loading state for UI feedback
- **Line 210-211**: Create date range using timestamps
- **Line 220**: `Object.values()` gets all values from object
- **Line 221**: Nested loops to process task groups
- **Line 223-230**: Defensive programming - provide fallback user data
- **Line 232**: Transform API response to local format
- **Line 237**: Type guard with `instanceof Error`
- **Line 239**: `finally` block always executes

**Key Learning Points:**

- **Loading states**: User experience during async operations
- **Object.values()**: Gets array of object's values
- **Nested loops**: Processing complex data structures
- **Defensive programming**: Handling missing data gracefully
- **Type guards**: Runtime type checking
- **Finally blocks**: Cleanup code that always runs

---

## Section 15: Form Handling and Subtask Management (Lines 246-290)

```javascript
const handleFormChange = (field: keyof TaskForm, value: any) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};

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
```

**Key Learning Points:**

- **keyof operator**: TypeScript ensures field exists on type
- **Object factory pattern**: Creating objects with default values
- **Immutable array updates**: Using spread operator to add items
- **Debugging**: Console.log for development feedback

---

## Section 16: Form Validation (Lines 355-390)

```javascript
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
    // ... more validations
  }

  return true;
};
```

**Key Learning Points:**

- **Input validation**: Client-side data validation
- **String.trim()**: Removes whitespace for validation
- **Early returns**: Stop validation on first error
- **Template literals**: Dynamic error messages
- **For loops**: Traditional loop for indexed access

---

## Section 17: Complex Form Submission (Lines 392-520)

This section demonstrates a sophisticated form submission handler that:

- Handles both create and update operations
- Manages nested subtasks
- Implements optimistic updates
- Provides comprehensive error handling

**Key patterns shown:**

- **Conditional logic**: Different paths for create vs update
- **Batch operations**: Handling multiple API calls
- **Error recovery**: Continuing execution despite partial failures
- **State synchronization**: Keeping UI in sync with server

---

## Section 18: useEffect Hooks (Lines 590-610)

```javascript
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
```

**Key Learning Points:**

- **useEffect with empty deps**: Runs once on mount
- **useEffect with deps**: Runs when dependencies change
- **Derived state**: Computing values based on other state
- **Boolean logic**: Complex conditions with logical operators

---

## Section 19: JSX Return and Rendering

The return statement contains the component's UI using Material-UI components. Key patterns:

**Conditional Rendering:**

```javascript
{
  selected.length > 0 && <ComponentToShow />;
}
```

**Array Mapping:**

```javascript
{
  Object.entries(groupedTasks).map(([weekKey, weekTasks]) => (
    <WeekComponent key={weekKey} />
  ));
}
```

**Event Handlers:**

```javascript
onClick={() => handleFunction(parameter)}
```

---

## Key React Patterns Used

1. **Hooks**: useState, useEffect, useMemo for state management
2. **Event Handling**: Synthetic events and custom handlers
3. **Conditional Rendering**: Showing/hiding UI based on state
4. **Lists and Keys**: Rendering dynamic lists with unique keys
5. **Form Handling**: Controlled components and validation
6. **Error Boundaries**: Try/catch for error handling
7. **Performance**: useMemo for expensive calculations
8. **Accessibility**: ARIA labels and semantic HTML

---

## Best Practices Demonstrated

1. **Immutability**: Never mutating state directly
2. **Type Safety**: TypeScript for better development experience
3. **Error Handling**: Comprehensive try/catch blocks
4. **Loading States**: User feedback during async operations
5. **Validation**: Client-side input validation
6. **Separation of Concerns**: Logical separation of different functionalities
7. **Performance**: Optimizing re-renders with useMemo
8. **User Experience**: Loading indicators, success/error messages

This component showcases production-level React development with modern patterns, comprehensive error handling, and sophisticated state management.
