"use client";

import { FullUser } from "@/types/user.types";
import { Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { userNameFormatter } from "@/utils/formatters.util";
import { useRouter } from "next/navigation";
import nProgress from "nprogress";
import { paths } from "@/utils/paths.utils";
import UserAvatar from "../nav-bar/user-avatar";

type Props = {
  user: FullUser;
  isYou: boolean;
};

const UserTableName = ({ user, isYou }: Props) => {
  const router = useRouter();
  const userName = userNameFormatter(
    user.firstName,
    user.lastName,
    user.otherName
  );

  const theme = useTheme();

  const openUserHandler = () => {
    nProgress.start();
    router.push(paths.dashboard.users.single(user.co_user_id));
  };

  return (
    <Stack direction="row" gap={1} alignItems="center">
      <UserAvatar
        clickHandler={openUserHandler}
        userName={userName}
        src={user.profile_picture}
      />
      <Stack>
        <Typography
          fontWeight={600}
          variant="body2"
          alignItems="center"
          //   component={RouterLink}
          //   href={paths.dashboard.users.single(user.co_user_id)}
          sx={{
            color: theme.typography.body2.color,
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
          onClick={openUserHandler}
        >
          {userName} {`${isYou ? "(You)" : ""}`}
        </Typography>
        <Typography variant="caption">{user.co_user_id}</Typography>
      </Stack>
    </Stack>
  );
};

export default UserTableName;
