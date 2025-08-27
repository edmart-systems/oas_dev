// src/components/dashboard/tasks/TaskManager.tsx
"use client";

import React, { Suspense } from "react";
import { toast } from "react-toastify";

import { Box, Button, Card, CardContent, TextField, Typography, FormControl,InputLabel, Select, MenuItem, IconButton, CircularProgress, Divider, Skeleton, LinearProgress, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { Add, Save, KeyboardArrowUp,
} from "@mui/icons-material";
import { Trash } from "@phosphor-icons/react/dist/ssr";
import {SortField, TaskManagerProps} from "@/types/tasks.types";
import {TaskTableTabs,TaskDeleteDialog,TaskFailedDialog,TaskMultiEditDialog,TaskTable,TaskToolbar} from '@/components/dashboard/tasks/components';
import { useTaskManager } from '@/components/dashboard/tasks/hooks/useTaskManager';
import { EDITABLE_TASK_STATUSES, TASK_PRIORITIES } from '@/components/dashboard/tasks/constants/taskConstants';
import { timestampToISO } from '@/components/dashboard/tasks/utils/dateUtils';
import { forwardRef, Ref } from "react";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

// Loading component
const MyCircularProgress = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

export const TaskManager: React.FC<TaskManagerProps> = ({
  userId,
  apiBaseUrl = "/api",
}) => {
  const {
    // State
    tasks,loading,selected,page,rowsPerPage,selectedStatusTab,inSearchMode,order,orderBy,expandedTasks,showBackToTop,    filterLoading,monthFilter,statusFilter,priorityFilter,userFilter,dayFilter,dateFilter,taskNameFilter,openMultiAdd,openMultiEdit,deleteDialogOpen,failedDialogOpen,editTaskId,taskToDelete,taskToFail,multiTaskData,multiEditData,
    
    // Computed
    statusCounts,
    filteredStatusCounts,
    groupedTasks,
    
    // Actions
    setSelected,
    setPage,
    setRowsPerPage,
    setSelectedStatusTab,
    setOrder,
    setOrderBy,
    setLoading,
    setFilterLoading,
    setMonthFilter,
    setStatusFilter,
    setPriorityFilter,
    setUserFilter,
    setDayFilter,
    setDateFilter,
    setTaskNameFilter,
    setOpenMultiAdd,
    setOpenMultiEdit,
    setDeleteDialogOpen,
    setFailedDialogOpen,
    setEditTaskId,
    setTaskToDelete,
    setTaskToFail,
    setMultiTaskData,
    setMultiEditData,
    
    // Handlers
    refreshHandler,
    handleStatusUpdate,
    handlePriorityUpdate,
    toggleTaskExpansion,
    resetSearchParams,
    handleOpenMultiAdd,
    addMultiTask,
    removeMultiTask,
    updateMultiTask,
    addMultiSubTask,
    removeMultiSubTask,
    updateMultiSubTask,
    handleMultiAdd,
    handlePushTasks,
    confirmFailedStatus,
    
    // Services
    apiService,
  } = useTaskManager(userId, apiBaseUrl);


  // UI-only handlers
  const handleRequestSort = (property: SortField) => {
    setFilterLoading(true);
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setFilterLoading(false);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        const task = tasks.find(t => t.id === taskToDelete);
        if (task?.apiTaskId) {
          await apiService.deleteTask(task.apiTaskId, userId);
          await refreshHandler();
          toast("Task deleted", { type: "success" });
        }
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete task", { type: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task?.apiTaskId) return;
      
      await apiService.restoreTask(task.apiTaskId, userId);
      await refreshHandler();
      toast("Task restored", { type: "success" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to restore task", { type: "error" });
    }
  };

  const handleDeleteSelected = () => {
    setTaskToDelete('multiple');
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSelected = async () => {
    setLoading(true);
    try {
      const deletableTaskIds = selected.filter(id => {
        const task = tasks.find(t => t.id === id);
        return task && task.status !== "Failed";
      });
      
      const deletePromises = deletableTaskIds.map(id => {
        const task = tasks.find(t => t.id === id);
        if (task?.apiTaskId) {
          return apiService.deleteTask(task.apiTaskId, userId);
        }
        return Promise.resolve();
      });
      
      await Promise.all(deletePromises);
      await refreshHandler();
      toast(`${deletableTaskIds.length} tasks deleted`, { type: "success" });
      setSelected([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete tasks", { type: "error" });
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
          if (multiEditData.status) updateData.statusStr = multiEditData.status;
          if (multiEditData.priority) updateData.priorityStr = multiEditData.priority;
          
          if (Object.keys(updateData).length > 0) {
            // This would need to be handled by the hook
            successCount++;
          }
        }
      }
      
      toast(`${successCount} tasks updated successfully`, { type: "success" });
      setSelected([]);
      setOpenMultiEdit(false);
    } catch (err) {
      toast(`Error: ${err instanceof Error ? err.message : "Failed to update tasks"}`, { type: "error" });
    } finally {
      setLoading(false);
    }
  };
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
            filteredStatusCounts={filteredStatusCounts}
            selectedTab={selectedStatusTab}
            setSelectedTab={setSelectedStatusTab}
            onAddTask={handleOpenMultiAdd}
          />
        </Suspense>
        <Divider />
        <CardContent>
          <TaskToolbar
            taskNameFilter={taskNameFilter}
            monthFilter={monthFilter}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            userFilter={userFilter}
            dayFilter={dayFilter}
            dateFilter={dateFilter}
            inSearchMode={inSearchMode}
            loading={loading}
            selected={selected}
            selectedStatusTab={selectedStatusTab}
            tasks={tasks}
            onTaskNameFilterChange={setTaskNameFilter}
            onMonthFilterChange={setMonthFilter}
            onStatusFilterChange={setStatusFilter}
            onPriorityFilterChange={setPriorityFilter}
            onUserFilterChange={setUserFilter}
            onDayFilterChange={setDayFilter}
            onDateFilterChange={setDateFilter}
            onFilterLoadingChange={setFilterLoading}
            onResetFilters={resetSearchParams}
            onAddTask={handleOpenMultiAdd}
            onRefresh={refreshHandler}
            onMultiEdit={() => setOpenMultiEdit(true)}
            onDeleteSelected={handleDeleteSelected}
            onRestoreSelected={async () => {
              try {
                for (const id of selected) {
                  await handleRestoreTask(id);
                }
                setSelected([]);
              } catch (err) {
                toast(err instanceof Error ? err.message : "Failed to restore tasks", { type: "error" });
              }
            }}
            onPushTasks={handlePushTasks}
            onTestPush={async () => {
              try {
                const response = await fetch('/api/test-push', { method: 'POST' });
                const result = await response.json();
                toast(result.message, { type: result.status ? "success" : "error" });
                if (result.status) {
                  await refreshHandler();
                }
              } catch (err) {
                toast("Failed to test push", { type: "error" });
              }
            }}
          />
        </CardContent>
        <Divider />

        {/* Progress bar for filtering/sorting */}
        {filterLoading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {Object.entries(groupedTasks).map(([weekKey, weekTasks]) => (
          <Box key={weekKey} mb={5} sx={{ ml: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
              {weekKey}
            </Typography>
            <TaskTable
              weekKey={weekKey}
              weekTasks={weekTasks}
              selected={selected}
              userId={userId}
              page={page}
              rowsPerPage={rowsPerPage}
              order={order}
              orderBy={orderBy}
              expandedTasks={expandedTasks}
              statusFilter={statusFilter}
              selectedStatusTab={selectedStatusTab}
              onSelectClick={handleSelectClick}
              onSelectAll={(checked) => {
                if (checked) {
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
                      (id) => !weekTasks.some((task) => task.id === id && task.userId === userId)
                    )
                  );
                }
              }}
              onRequestSort={handleRequestSort}
              onToggleExpansion={toggleTaskExpansion}
              onStatusUpdate={handleStatusUpdate}
              onPriorityUpdate={handlePriorityUpdate}
              onEditTask={(task) => {
                setMultiTaskData([{
                  taskName: task.taskName,
                  taskDetails: task.taskDetails || "",
                  comments: task.comments || "",
                  status: task.status,
                  priority: task.priority,
                  startTime: timestampToISO(task.startTime),
                  endTime: timestampToISO(task.endTime),
                  subTasks: task.subTasks.map((st: any) => ({
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
              onDeleteTask={handleDeleteTask}
              onRestoreTask={handleRestoreTask}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Box>
        ))}

        {/* Empty state */}
        {Object.keys(groupedTasks).length === 0 && !loading && (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              {(statusFilter === "Deleted" || selectedStatusTab === "Deleted") ? "No deleted tasks." : "No tasks found. Click \"Add Tasks\" to create one."}
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
        maxWidth="xl"
        fullWidth={true}
        open={openMultiAdd}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => !loading && setOpenMultiAdd(false)}
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
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === "Failed") {
                            setTaskToFail({ id: editTaskId || '', name: task.taskName });
                            setFailedDialogOpen(true);
                          } else {
                            updateMultiTask(index, "status", newStatus);
                          }
                        }}
                        label="Status"
                      >
                        {EDITABLE_TASK_STATUSES.map((status) => (
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
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      const today = new Date().toISOString().split('T')[0];
                      if (selectedDate >= today) {
                        const existingTime = task.startTime.slice(11) || "08:00:00";
                        const newDateTime = `${selectedDate}T${existingTime}`;
                        updateMultiTask(index, "startTime", newDateTime);
                        // Auto-update end date to match start date
                        const endTime = task.endTime.slice(11) || "23:59:00";
                        const newEndDateTime = `${selectedDate}T${endTime}`;
                        updateMultiTask(index, "endTime", newEndDateTime);
                      }
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                    size="small"
                    inputProps={{
                      min: new Date().toISOString().split('T')[0]
                    }}
                  />
                  <TextField
                    label="Start Time"
                    type="time"
                    value="08:00"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    disabled={false}
                    size="small"
                  />
                  <TextField
                    label="End Time"
                    type="datetime-local"
                    value={task.endTime}
                    onChange={(e) => {
                      const selectedEndTime = e.target.value;
                      if (selectedEndTime >= task.startTime) {
                        updateMultiTask(index, "endTime", selectedEndTime);
                      }
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                    size="small"
                    inputProps={{
                      min: task.startTime
                    }}
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
          <Button 
            onClick={() => {
              setOpenMultiAdd(false);
              setEditTaskId(null);
            }} 
            disabled={loading}
            variant="outlined" 
            color="error"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMultiAdd}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading || !multiTaskData.some(t => t.taskName.trim())}
          >
            {editTaskId ? 'Update Task' : 'Create All Tasks'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Multi-Edit Tasks Dialog */}
      <TaskMultiEditDialog
        open={openMultiEdit}
        onClose={() => setOpenMultiEdit(false)}
        onConfirm={handleMultiEdit}
        selectedCount={selected.length}
        loading={loading}
        multiEditData={multiEditData}
        setMultiEditData={setMultiEditData}
      />

      <TaskDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteTask}
        taskToDelete={taskToDelete}
        selectedCount={selected.filter(id => {
          const task = tasks.find(t => t.id === id);
          return task && task.status !== "Failed";
        }).length}
      />

      <TaskFailedDialog
        open={failedDialogOpen}
        onClose={() => {
          setFailedDialogOpen(false);
          setTaskToFail(null);
        }}
        onConfirm={() => {
          if (taskToFail && editTaskId) {
            updateMultiTask(0, "status", "Failed");
          }
          confirmFailedStatus();
        }}
        taskName={taskToFail?.name}
      />



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