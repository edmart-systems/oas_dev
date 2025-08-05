// src/components/dashboard/tasks/TaskManager.tsx

"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Tabs,
  Tab,
  Checkbox,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Delete, RadioButtonUnchecked, CheckCircle, Event } from "@mui/icons-material";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
}

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (text: string, priority: "low" | "medium" | "high") => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onClearCompleted: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}) => {
  const [newTask, setNewTask] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const activeTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim(), selectedPriority);
      setNewTask("");
      setSelectedPriority("medium");
    }
  };

  return (
    <Box maxWidth="md" mx="auto" p={4}>
      {/* Stats */}
      <Box display="flex" justifyContent="space-between" mt={4} gap={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <RadioButtonUnchecked color="primary" />
              <Box>
                <Typography variant="subtitle2">Active Tasks</Typography>
                <Typography variant="h6">{activeTasks}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <CheckCircle color="success" />
              <Box>
                <Typography variant="subtitle2">Completed</Typography>
                <Typography variant="h6">{completedTasks}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Event color="secondary" />
              <Box>
                <Typography variant="subtitle2">Total Tasks</Typography>
                <Typography variant="h6">{tasks.length}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Add Task */}
      <Card sx={{ mt: 4 }}>
        <CardHeader title="Add New Task" />
        <CardContent>
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
            <TextField
              fullWidth
              label="Enter a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as "low" | "medium" | "high")}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddTask}>
              Add Task
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title="Your Tasks"
          action={
            completedTasks > 0 && (
              <Button variant="outlined" size="small" onClick={onClearCompleted}>
                Clear Completed
              </Button>
            )
          }
        />
        <CardContent>
          <Tabs
            value={filter}
            onChange={(e, newValue) => setFilter(newValue)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={`All (${tasks.length})`} value="all" />
            <Tab label={`Active (${activeTasks})`} value="active" />
            <Tab label={`Completed (${completedTasks})`} value="completed" />
          </Tabs>

          <Box mt={2}>
            {filteredTasks.length === 0 ? (
              <Typography align="center" color="text.secondary" py={4}>
                {filter === "active" && "All tasks are completed!"}
                {filter === "completed" && "No completed tasks yet."}
                {filter === "all" && "Add your first task above."}
              </Typography>
            ) : (
              filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  sx={{ mb: 2, backgroundColor: task.completed ? "#f0f0f0" : "white" }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Checkbox
                      checked={task.completed}
                      onChange={() => onToggleTask(task.id)}
                      inputProps={{ "aria-label": "Mark completed" }}
                    />
                    <Box flex={1}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          textDecoration: task.completed ? "line-through" : "none",
                          color: task.completed ? "text.secondary" : "text.primary",
                        }}
                      >
                        {task.text}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Chip label={task.priority} color={getPriorityColor(task.priority)} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {task.createdAt.toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton onClick={() => onDeleteTask(task.id)} color="error">
                      <Delete />
                    </IconButton>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
