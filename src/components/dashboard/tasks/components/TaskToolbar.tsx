import React, { Suspense } from "react";
import {
  Box,
  Button,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Add, Refresh, Launch, AddCircle, Forward } from "@mui/icons-material";
import { PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import {
  TaskMonthFilter,
  TaskStatusFilter,
  TaskPriorityFilter,
  TaskUserFilter,
  TaskDayFilter,
  TaskDateFilter,
} from '@/components/dashboard/tasks/components';
import { TaskItem } from "@/types/tasks.types";

const MyCircularProgress = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

interface TaskToolbarProps {
  taskNameFilter: string;
  monthFilter: string;
  statusFilter: string;
  priorityFilter: string;
  userFilter: string;
  dayFilter: string;
  dateFilter: string;
  inSearchMode: boolean;
  loading: boolean;
  selected: string[];
  selectedStatusTab: string;
  tasks: TaskItem[];
  onTaskNameFilterChange: (value: string) => void;
  onMonthFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPriorityFilterChange: (value: string) => void;
  onUserFilterChange: (value: string) => void;
  onDayFilterChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
  onFilterLoadingChange: (loading: boolean) => void;
  onResetFilters: () => void;
  onAddTask: () => void;
  onRefresh: () => void;
  onMultiEdit: () => void;
  onDeleteSelected: () => void;
  onRestoreSelected: () => void;
  onPushTasks: () => void;
  onTestPush?: () => void;
}

export const TaskToolbar: React.FC<TaskToolbarProps> = ({
  taskNameFilter,
  monthFilter,
  statusFilter,
  priorityFilter,
  userFilter,
  dayFilter,
  dateFilter,
  inSearchMode,
  loading,
  selected,
  selectedStatusTab,
  tasks,
  onTaskNameFilterChange,
  onMonthFilterChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onUserFilterChange,
  onDayFilterChange,
  onDateFilterChange,
  onFilterLoadingChange,
  onResetFilters,
  onAddTask,
  onRefresh,
  onMultiEdit,
  onDeleteSelected,
  onRestoreSelected,
  onPushTasks,
  onTestPush,
}) => {
  return (
    <>
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
              onChange={(e) => onTaskNameFilterChange(e.target.value)}
              sx={{ minWidth: 150 }}
            />
            <Suspense fallback={<MyCircularProgress />}>
              <TaskMonthFilter value={monthFilter} onChange={onMonthFilterChange} onLoadingChange={onFilterLoadingChange} />
            </Suspense>
            <Suspense fallback={<MyCircularProgress />}>
              <TaskStatusFilter value={statusFilter} onChange={onStatusFilterChange} />
            </Suspense>
            <Suspense fallback={<MyCircularProgress />}>
              <TaskPriorityFilter value={priorityFilter} onChange={onPriorityFilterChange} />
            </Suspense>
            <Suspense fallback={<MyCircularProgress />}>
              <TaskUserFilter value={userFilter} onChange={onUserFilterChange} tasks={tasks} />
            </Suspense>
            <Suspense fallback={<MyCircularProgress />}>
              <TaskDayFilter value={dayFilter} onChange={onDayFilterChange} onDateChange={onDateFilterChange} />
            </Suspense>
            <Suspense fallback={<MyCircularProgress />}>
              <TaskDateFilter value={dateFilter} onChange={onDateFilterChange} onDayChange={onDayFilterChange} />
            </Suspense>
            {inSearchMode && (
              <Button variant="text" onClick={onResetFilters}>
                Clear Filters
              </Button>
            )}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ minWidth: "max-content", paddingLeft:"15px" }}>
            <Button
              variant="contained"
              size="medium"
              endIcon={<AddCircle />}
              onClick={onAddTask}
            >
              New
            </Button>
            {loading ? (
              <MyCircularProgress />
            ) : (
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={onRefresh}
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
              {(() => {
                const taskMap = new Map(tasks.map(t => [t.id, t]));
                return selected.filter(id => {
                  const task = taskMap.get(id);
                  return task && task.status !== "Failed";
                }).length;
              })()} Selected
            </Typography>
            {(statusFilter === "Deleted" || selectedStatusTab === "Deleted") ? (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<Launch />}
                onClick={onRestoreSelected}
              >
                Restore Selected
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<PencilSimple />}
                  onClick={onMultiEdit}
                  size="small"
                >
                  Edit Selected
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<Trash />}
                  onClick={onDeleteSelected}
                >
                  Delete Selected
                </Button>
              </>
            )}
          </Stack>
        </Box>
      )}
    </>
  );
};