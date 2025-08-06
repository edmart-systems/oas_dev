// src/app/dashboard/task/page.tsx

"use client";

import PageTitle from "@/components/dashboard/common/page-title";
import { TaskManager } from "@/components/dashboard/tasks/TaskManager";
import { Stack, Button } from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import Link from "next/link";
import { paths } from "@/utils/paths.utils";
import { useSession } from "next-auth/react";
import ScreenLoader from "@/components/common/screen-loading";

const TasksPage = () => {
  const { data: session, status } = useSession();

  
  if (status === "loading") {
    return <ScreenLoader fullScreen />;
  }

  
  if (!session?.user) {
    return null;
  }

  const userId = session.user.userId; 
  
  return (
    <Stack spacing={3}>
      <TaskManager userId={userId} />
    </Stack>
  );
};

export default TasksPage;