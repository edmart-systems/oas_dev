// src/components/dashboard/tasks/components/TaskTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Box,
  Typography,
  IconButton,
  Checkbox,
  Card,
} from "@mui/material";
import { ExpandMore, ChevronRight, Launch } from "@mui/icons-material";
import { PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import UserAvatar from "@/components/dashboard/nav-bar/user-avatar";
import { TaskStatusChip, TaskPriorityChip, InlineStatusSelect, InlinePrioritySelect } from '@/components/dashboard/tasks/components';
import { TaskItem, SortField, TaskStatus, TaskPriority } from "@/types/tasks.types";
import { timestampToISO } from '@/components/dashboard/tasks/utils/dateUtils';
import { hoverBackground } from "@/utils/styles.utils";

interface TaskTableProps {
  weekKey: string;
  weekTasks: TaskItem[];
  selected: string[];
  userId: number;
  page: number;
  rowsPerPage: number;
  order: 'asc' | 'desc';
  orderBy: SortField;
  expandedTasks: Set<string>;
  statusFilter: string;
  selectedStatusTab: string;
  onSelectClick: (event: React.MouseEvent<unknown>, id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onRequestSort: (property: SortField) => void;
  onToggleExpansion: (taskId: string) => void;
  onStatusUpdate: (taskId: string, status: TaskStatus) => void;
  onPriorityUpdate: (taskId: string, priority: TaskPriority) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onRestoreTask: (taskId: string) => void;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  weekKey,
  weekTasks,
  selected,
  userId,
  page,
  rowsPerPage,
  order,
  orderBy,
  expandedTasks,
  statusFilter,
  selectedStatusTab,
  onSelectClick,
  onSelectAll,
  onRequestSort,
  onToggleExpansion,
  onStatusUpdate,
  onPriorityUpdate,
  onEditTask,
  onDeleteTask,
  onRestoreTask,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  return (
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
                      weekTasks.some((t) => t.id === id && t.userId === userId && (t.status as TaskStatus) !== "Failed")
                    ).length > 0 &&
                    selected.filter((id) =>
                      weekTasks.some((t) => t.id === id && t.userId === userId && (t.status as TaskStatus) !== "Failed")
                    ).length < weekTasks.filter(t => t.userId === userId && (t.status as TaskStatus) !== "Failed").length
                  }
                  checked={
                    weekTasks.filter(t => t.userId === userId && (t.status as TaskStatus) !== "Failed").length > 0 &&
                    selected.filter((id) =>
                      weekTasks.some((t) => t.id === id && t.userId === userId && (t.status as TaskStatus) !== "Failed")
                    ).length === weekTasks.filter(t => t.userId === userId && (t.status as TaskStatus) !== "Failed").length
                  }
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ minWidth: "350px", width: "50%" }}>
                <TableSortLabel
                  active={orderBy === "taskName"}
                  direction={orderBy === "taskName" ? order : "asc"}
                  onClick={() => onRequestSort("taskName")}
                >
                  Task
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: "60px" }}>
                <TableSortLabel
                  active={orderBy === "user"}
                  direction={orderBy === "user" ? order : "asc"}
                  onClick={() => onRequestSort("user")}
                >
                  User
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: "130px" }}>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => onRequestSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: "100px" }}>
                <TableSortLabel
                  active={orderBy === "startTime"}
                  direction={orderBy === "startTime" ? order : "asc"}
                  onClick={() => onRequestSort("startTime")}
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
                  onClick={() => onRequestSort("priority")}
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
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                    sx={(theme) => ({
                      cursor: "pointer",
                      background: index % 2 !== 0 ? hoverBackground(theme) : "",
                    })}
                  >
                    <TableCell padding="checkbox" sx={{ maxWidth: "30px", px: 0.5 }}>
                      {task.userId === userId && (task.status as TaskStatus) !== "Failed" ? (
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onClick={(event) => onSelectClick(event, task.id)}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      ) : (
                        <Box sx={{ width: 14, height: 14 }} />
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: "350px", width: "50%", py: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                          <Typography fontWeight={600} variant="body2" sx={{ lineHeight: 1.2 }}>
                            {task.taskName}
                          </Typography>
                          {task.subTasks.length > 0 && (
                            <IconButton
                              size="small"
                              onClick={() => onToggleExpansion(task.id)}
                              sx={{ ml: 0.5, p: 0.25, minWidth: 20 }}
                            >
                              {expandedTasks.has(task.id) ? (
                                <ExpandMore sx={{ fontSize: 14 }} />
                              ) : (
                                <ChevronRight sx={{ fontSize: 14 }} />
                              )}
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      {task.subTasks.length > 0 && expandedTasks.has(task.id) && (
                        <Box sx={{ mt: 0.5, ml: 0.5, borderLeft: "1px solid", borderColor: "divider", pl: 0.5 }}>
                          {task.subTasks
                            .filter(subtask => task.deleted ? true : !subtask.deleted)
                            .map((subtask) => (
                            <Box key={subtask.id} sx={{ py: 0.25 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', lineHeight: 1.2 }}>
                                • {subtask.taskName}
                              </Typography>
                              {subtask.taskDetails && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.1 }}>
                                  {subtask.taskDetails}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell sx={{ maxWidth: "30px" }}>
                      <UserAvatar
                        userName={task.user ? `${task.user.firstName} ${task.user.lastName}` : `User ${task.userId}`}
                        src={task.user?.profile_picture}
                        size={40}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: "140px", width: "140px" }}>
                      {task.userId === userId && (task.status as TaskStatus) !== "Failed" ? (
                        <InlineStatusSelect
                          value={task.status}
                          taskId={task.id}
                          onUpdate={onStatusUpdate}
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
                      {task.userId === userId && (task.status as TaskStatus) !== "Failed" ? (
                        <InlinePrioritySelect
                          value={task.priority}
                          taskId={task.id}
                          onUpdate={onPriorityUpdate}
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
                          {(statusFilter === "Deleted" || selectedStatusTab === "Deleted") ? (
                            <Tooltip title="Restore">
                              <IconButton
                                color="success"
                                onClick={() => onRestoreTask(task.id)}
                                size="small"
                              >
                                <Launch sx={{ width: "18px", height: "18px" }} />
                              </IconButton>
                            </Tooltip>
                          ) : (task.status as TaskStatus) === "Failed" ? (
                            <Typography variant="caption" color="text.secondary">
                              Expired - View Only
                            </Typography>
                          ) : (
                            <>
                              <Tooltip title={task.endTime < Date.now() ? "Task ended - cannot edit" : "Edit"}>
                                <IconButton
                                  color="primary"
                                  onClick={() => onEditTask(task)}
                                  size="small"
                                  disabled={(task.status as TaskStatus) === "Failed"}
                                >
                                  <PencilSimple size={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  color="error"
                                  onClick={() => onDeleteTask(task.id)}
                                  size="small"
                                >
                                  <Trash size={18} />
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
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
      />
    </Card>
  );
};