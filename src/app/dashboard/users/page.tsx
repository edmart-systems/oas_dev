import MyCircularProgress from "@/components/common/my-circular-progress";
import PageTitle from "@/components/dashboard/common/page-title";
import UsersTable from "@/components/dashboard/users/users-table";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Users | Office X",
  description: "Office Automation System",
};

const UsersPage = () => {
  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
        <PageTitle title="Users" />
      </Stack>
      <Suspense fallback={<MyCircularProgress />}>
        <UsersTable />
      </Suspense>
    </Stack>
  );
};

export default UsersPage;
