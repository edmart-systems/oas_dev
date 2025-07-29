// src/components/dashboard/tasks/TaskManagerContainer.tsx

"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import { TaskManager, Task } from "./TaskManager1";

// Dummy useTasks hook (replace with your real one)
function useTasks(userId: number) {
  // Replace this with your real data fetching + mutation logic
  const [tasks, setTasks] = React.useState<Task[]>([
    {
      id: 1,
      text: "Example task",
      completed: false,
      priority: "medium",
      createdAt: new Date(),
    },
  ]);

  const createTask = (text: string, priority: "low" | "medium" | "high") => {
    const newTask: Task = {
      id: Date.now(),
      text,
      completed: false,
      priority,
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  return {
    tasks,
    createTask,
    toggleTask,
    deleteTask,
    clearCompleted,
  };
}

export const TaskManagerContainer: React.FC = () => {
  const { data: session, status } = useSession();

  // Wait for session to be loaded
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const userId = session?.user?.userId;

  if (!userId) {
    return <div>Please login to see tasks.</div>;
  }

  const { tasks, createTask, toggleTask, deleteTask, clearCompleted } = useTasks(userId);

  return (
    <TaskManager
      tasks={tasks}
      onAddTask={createTask}
      onToggleTask={toggleTask}
      onDeleteTask={deleteTask}
      onClearCompleted={clearCompleted}
    />
  );
};
