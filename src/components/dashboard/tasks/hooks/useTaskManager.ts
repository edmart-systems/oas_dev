import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { TaskApiService } from "@/components/dashboard/tasks/services/TaskApiService";
import { convertApiTaskToLocal, filterTasks, sortTasks, groupTasksByWeek, generateId } from "@/components/dashboard/tasks/utils/taskUtils";
import { getUgandaDateTime, isoToTimestamp } from "@/components/dashboard/tasks/utils/dateUtils";
import { TaskItem, TaskForm, SubTaskForm, TaskStatus, TaskPriority, SortDirection, SortField } from "@/types/tasks.types";

export const useTaskManager = (userId: number, apiBaseUrl: string = "/api") => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("All");
  const [inSearchMode, setInSearchMode] = useState(false);
  const [order, setOrder] = useState<SortDirection>("desc");
  const [orderBy, setOrderBy] = useState<SortField>("startTime");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // Filter states
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [taskNameFilter, setTaskNameFilter] = useState("");

  // Dialog states
  const [openMultiAdd, setOpenMultiAdd] = useState(false);
  const [openMultiEdit, setOpenMultiEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [multiTaskData, setMultiTaskData] = useState<TaskForm[]>([]);
  const [multiEditData, setMultiEditData] = useState<Partial<TaskForm>>({});

  const apiService = useMemo(() => new TaskApiService(apiBaseUrl), [apiBaseUrl]);

  const statusCounts = useMemo(() => {
    return tasks.reduce((counts, task) => {
      if (task.deleted) {
        counts["Deleted"] = (counts["Deleted"] || 0) + 1;
      } else {
        const status = task.status;
        counts[status] = (counts[status] || 0) + 1;
      }
      return counts;
    }, {} as Record<TaskStatus | "Deleted", number>);
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterTasks(tasks, {
      selectedStatusTab,
      statusFilter,
      monthFilter,
      priorityFilter,
      userFilter,
      dayFilter,
      dateFilter,
      taskNameFilter,
    });
    return sortTasks(filtered, order, orderBy);
  }, [
    tasks,
    selectedStatusTab,
    statusFilter,
    monthFilter,
    priorityFilter,
    userFilter,
    dayFilter,
    dateFilter,
    taskNameFilter,
    order,
    orderBy,
  ]);

  const groupedTasks = useMemo(() => {
    return groupTasksByWeek(filteredAndSortedTasks);
  }, [filteredAndSortedTasks]);

  const refreshHandler = async () => {
    setLoading(true);
    try {
      const startOf2024 = new Date('2024-01-01').getTime();
      const endOf2026 = new Date('2026-12-31').getTime();
      
      const response = await apiService.getTasksInRange(startOf2024, endOf2026, 0);
      const transformedTasks: TaskItem[] = [];
      let currentUserName = "";

      for (const taskGroup of Object.values(response.tasks)) {
        for (const apiTask of taskGroup) {
          if (!apiTask.user) {
            apiTask.user = {
              co_user_id: apiTask.userId,
              firstName: `User`,
              lastName: `${apiTask.userId}`,
              email: "",
            };
          }

          if (apiTask.userId === userId && apiTask.user) {
            currentUserName = `${apiTask.user.firstName} ${apiTask.user.lastName}`;
          }

          const localTask = convertApiTaskToLocal(apiTask);
          transformedTasks.push(localTask);
        }
      }

      setTasks(transformedTasks);
      
      if (currentUserName && !userFilter) {
        setUserFilter(currentUserName);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to fetch tasks", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.apiTaskId || task.userId !== userId) {
      toast("You can only update your own tasks", { type: "error" });
      return;
    }

    try {
      await apiService.updateTask(task.apiTaskId, userId, { statusStr: newStatus });

      if (newStatus === "Failed") {
        await refreshHandler();
        toast("Task failed", { type: "success" });
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
        if (newStatus !== "Pending") {
          toast("Status updated successfully", { type: "success" });
        }
      }
    } catch (err) {
      toast("Failed to update status", { type: "error" });
      throw err;
    }
  };

  const handlePriorityUpdate = async (taskId: string, newPriority: TaskPriority) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.apiTaskId || task.userId !== userId) {
      toast("You can only update your own tasks", { type: "error" });
      return;
    }

    try {
      await apiService.updateTask(task.apiTaskId, userId, { priorityStr: newPriority });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
      );
      toast("Priority updated successfully", { type: "success" });
    } catch (err) {
      toast("Failed to update priority", { type: "error" });
    }
  };

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

  const handleOpenMultiAdd = () => {
    const { nowISO, endISO } = getUgandaDateTime();
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
    const { nowISO, endISO } = getUgandaDateTime();
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
    const { nowISO, endISO } = getUgandaDateTime();
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
  }, [multiTaskData]);

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

  const handlePushTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks/push-pending', { method: 'POST' });
      const result = await response.json();
      
      if (result.status) {
        toast(result.message, { type: "success" });
        await refreshHandler();
      } else {
        toast(result.message || "Failed to push tasks", { type: "error" });
      }
    } catch (err) {
      toast("Failed to push tasks", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleMultiAdd = async () => {
    setLoading(true);
    try {
      let successCount = 0;
      for (let i = 0; i < multiTaskData.length; i++) {
        const taskData = multiTaskData[i];
        if (taskData.taskName.trim()) {
          if (editTaskId && i === 0) {
            const task = tasks.find((t) => t.id === editTaskId);
            if (task?.apiTaskId) {
              // Update main task
              await apiService.updateTask(task.apiTaskId, userId, {
                taskName: taskData.taskName.trim(),
                taskDetails: taskData.taskDetails?.trim() || "",
                comments: taskData.comments?.trim() || "",
                statusStr: taskData.status,
                priorityStr: taskData.priority,
                startTime: isoToTimestamp(taskData.startTime),
                endTime: isoToTimestamp(taskData.endTime),
              });
              
              // Handle subtasks
              for (const subTask of taskData.subTasks) {
                if (subTask.taskName.trim()) {
                  if (subTask.apiSubTaskId) {
                    // Update existing subtask
                    await apiService.updateSubTask(subTask.apiSubTaskId, userId, {
                      taskId: task.apiTaskId,
                      taskName: subTask.taskName.trim(),
                      taskDetails: subTask.taskDetails?.trim() || "",
                      comments: subTask.comments?.trim() || "",
                      status: subTask.status,
                      priority: subTask.priority,
                      startTime: isoToTimestamp(subTask.startTime),
                      endTime: isoToTimestamp(subTask.endTime),
                    });
                  } else {
                    // Add new subtask
                    await apiService.addSubTasks(task.apiTaskId, userId, [{
                      taskName: subTask.taskName.trim(),
                      taskDetails: subTask.taskDetails?.trim() || "",
                      comments: subTask.comments?.trim() || "",
                      status: subTask.status,
                      priority: subTask.priority,
                      startTime: isoToTimestamp(subTask.startTime),
                      endTime: isoToTimestamp(subTask.endTime),
                    }]);
                  }
                }
              }
              successCount++;
            }
          } else {
            const subtasksPayload = taskData.subTasks
              .filter(st => st.taskName.trim())
              .map(st => ({
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
      

      
      toast(`${successCount} tasks ${editTaskId ? 'updated' : 'created'} successfully`, { type: "success" });
      setEditTaskId(null);
      setOpenMultiAdd(false);
      await refreshHandler();
    } catch (err) {
      toast(`Error: ${err instanceof Error ? err.message : "Failed to process tasks"}`, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshHandler();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return {
    // State
    tasks,
    loading,
    selected,
    page,
    rowsPerPage,
    selectedStatusTab,
    inSearchMode,
    order,
    orderBy,
    expandedTasks,
    showBackToTop,
    filterLoading,
    monthFilter,
    statusFilter,
    priorityFilter,
    userFilter,
    dayFilter,
    dateFilter,
    taskNameFilter,
    openMultiAdd,
    openMultiEdit,
    deleteDialogOpen,
    editTaskId,
    taskToDelete,
    multiTaskData,
    multiEditData,
    
    // Computed
    statusCounts,
    filteredAndSortedTasks,
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
    setEditTaskId,
    setTaskToDelete,
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
    
    // Services
    apiService,
  };
};