import {
  fetchSingleUser,
  fetchSingleUserPageData,
} from "@/server-actions/user-actions/user.actions";
import PageGoBack from "@/components/dashboard/common/page-go-back";
import UserStatusActions from "@/components/dashboard/users/user/user-status-actions";
import UserSysActionsCard from "@/components/dashboard/users/user/user-sys-actions-card";
import UserAddressCard from "@/components/dashboard/users/user/user-address-card";
import UserBasicInfoCard from "@/components/dashboard/users/user/user-basic-info-card";
import UserFinanceInfoCard from "@/components/dashboard/users/user/user-finance-info-card";
import UserAcademicInfoCard from "@/components/dashboard/users/user/user-academic-info-card";
import UserInvoicesCard from "@/components/dashboard/users/user/user-invoices-card";
import UserKinInfoCard from "@/components/dashboard/users/user/user-kin-info-card";
import UserMaritalInfoCard from "@/components/dashboard/users/user/user-marital-info-card";
import UserNameAvatar from "@/components/dashboard/users/user/user-name-avatar";
import UserQuotesCard from "@/components/dashboard/users/user/user-quotes-card";
import { SingleUserPageData } from "@/types/user.types";
import { paths } from "@/utils/paths.utils";
import { Box, Grid2 as Grid, Stack } from "@mui/material";
import { Metadata } from "next";
import { redirect, useRouter } from "next/navigation";

export const metadata: Metadata = {
  title: "User | Office X",
  description: "Office Automation System",
};

type Props = {
  params: Promise<{ id: string }>;
};

const getPageData = async (
  userId: string
): Promise<SingleUserPageData | null> => {
  try {
    const res = await fetchSingleUserPageData(userId);

    if (res.status && res.data) {
      return Promise.resolve(res.data);
    }

    return Promise.resolve(null);
  } catch (err) {
    return Promise.resolve(null);
  }
};

const SingleUserPage = async ({ params }: Props) => {
  const { id } = await params;
  const pageData = await getPageData(id);

  if (!pageData) {
    return redirect(paths.errors.notFound);
  }

  const { user, userRoles } = pageData;

  return (
    <Stack spacing={3}>
      <Stack>
        <PageGoBack backName="Users" />
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <UserNameAvatar user={user} />
        <Box>
          <UserStatusActions user={user} />
        </Box>
      </Stack>
      <Grid container spacing={3}>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <Grid size={12}>
            <UserBasicInfoCard user={user} userRoles={userRoles} />
          </Grid>
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }} container spacing={2}>
          <Grid size={12}>
            <UserFinanceInfoCard />
          </Grid>
          <Grid size={12}>
            <UserMaritalInfoCard />
          </Grid>
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }} container spacing={2}>
          <Grid size={12}>
            <UserKinInfoCard />
          </Grid>
          <Grid size={12}>
            <UserAcademicInfoCard />
          </Grid>
        </Grid>

        <Grid size={{ lg: 5, md: 12, sm: 12, xs: 12 }} container spacing={2}>
          <Grid size={12}>
            <UserAddressCard />
          </Grid>
        </Grid>
        <Grid size={{ lg: 7, md: 12, sm: 12, xs: 12 }} container spacing={2}>
          <Grid size={12}>
            <UserSysActionsCard />
          </Grid>
        </Grid>
        <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }} container spacing={2}>
          <Grid size={12}>
            <UserQuotesCard />
          </Grid>
        </Grid>
        <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }} container spacing={2}>
          <Grid size={12}>
            <UserInvoicesCard />
          </Grid>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SingleUserPage;
