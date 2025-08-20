import { FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { TaskStatus, TaskPriority, TaskItem } from "@/types/tasks.types";
import { useMemo } from "react";

const TASK_STATUSES: TaskStatus[] = [
  "Pending",
  "In-Progress",
  "Stalled", 
  "Failed",
  "Done",
  "Completed",
];

const TASK_PRIORITIES: TaskPriority[] = ["Urgent", "High", "Moderate", "Low"];

const MONTHS = [
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

interface TaskMonthFilterProps {
  value: string;
  onChange: (value: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export const TaskMonthFilter = ({ value, onChange, onLoadingChange }: TaskMonthFilterProps) => {

  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>Month</InputLabel>
      <Select
        label="Month"
        value={value}
        onChange={(e) => {
          onLoadingChange?.(true);
          onChange(e.target.value);
          onLoadingChange?.(false);
        }}
      >
        {MONTHS.map((month) => (
          <MenuItem key={month.value} value={month.value}>
            {month.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

interface TaskStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskStatusFilter = ({ value, onChange }: TaskStatusFilterProps) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Status</InputLabel>
      <Select
        label="Status"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Deleted">Deleted</MenuItem>
        {TASK_STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

interface TaskPriorityFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskPriorityFilter = ({ value, onChange }: TaskPriorityFilterProps) => {
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

interface TaskUserFilterProps {
  value: string;
  onChange: (value: string) => void;
  tasks: TaskItem[];
}

export const TaskUserFilter = ({ value, onChange, tasks }: TaskUserFilterProps) => {
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

interface TaskDayFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskDayFilter = ({ value, onChange }: TaskDayFilterProps) => {
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

interface TaskDateFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskDateFilter = ({ value, onChange }: TaskDateFilterProps) => {
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