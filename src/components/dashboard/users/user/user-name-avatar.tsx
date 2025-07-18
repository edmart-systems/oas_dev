"use client";

import { FullUser } from "@/types/user.types";
import { Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import UserAvatar from "../../nav-bar/user-avatar";
import { userNameFormatter } from "@/utils/formatters.util";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserStatusChip from "./user-status-chip";

type Props = {
  user: FullUser;
};

const UserNameAvatar = ({ user }: Props) => {
  const { data: sessionData } = useSession();
  const userName = userNameFormatter(
    user.firstName,
    user.lastName,
    user.otherName
  );

  const isYou = sessionData
    ? sessionData.user.co_user_id === user.co_user_id
    : false;

  return (
    <Stack
      direction="row"
      gap={2}
      alignItems="center"
      sx={{ cursor: "pointer" }}
    >
      <UserAvatar size={60} userName={userName} src={user.profile_picture} />
      <Stack gap={0}>
        <Typography
          fontWeight={600}
          // variant="h6"
          fontSize="24px"
          alignItems="center"
        >
          {userName} {`${isYou ? "(You)" : ""}`}&ensp;
          <UserStatusChip status={user.status} />
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {user.email}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default UserNameAvatar;
