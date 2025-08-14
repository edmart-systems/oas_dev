"use client";

import { FullUser, UserRoleDto } from "@/types/user.types";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { User } from "@phosphor-icons/react/dist/ssr";
import React, { useMemo, useState } from "react";
import UserInfoCardItem from "./user-info-card-item";
import {
  capitalizeFirstLetter,
  formatDisplayedPhoneNumber,
  userNameFormatter,
} from "@/utils/formatters.util";
import UserStatusChip from "./user-status-chip";
import VerifiedChip from "./verified-chip";
import { toast } from "react-toastify";
import { fDateTime12, fToNow } from "@/utils/time.utils";
import { hoverBackground, sxFlexRowSpaceBtn } from "@/utils/styles.utils";
import SelectRoleDialog from "./user-role/select-role-dialog";
import { useSession } from "next-auth/react";

type Props = {
  user: FullUser;
  userRoles: UserRoleDto[];
};

export const MyCardContent = styled(CardContent)(({ theme }) => ({
  paddingTop: "5px",
  paddingBottom: "5px",
  transition: "0.5s all ease",
  "&:hover": {
    background: hoverBackground(theme),
  },
}));

const UserBasicInfoCard = ({ user, userRoles }: Props) => {
  const { data: sessionData } = useSession();
  const [openSetRole, setOpenSetRole] = useState<boolean>(false);

  const isYou = sessionData
    ? sessionData.user.co_user_id === user.co_user_id
    : false;

  const showChangeRole: boolean = useMemo(() => {
    if (!sessionData) return false;

    return (
      (user.status.status === "active" || user.status.status === "blocked") &&
      !(sessionData.user.co_user_id === user.co_user_id) &&
      sessionData.user.role_id === 1
    );
  }, [user, sessionData]);

  const openNinHandler = () => {
    toast("Card not available", {
      type: "info",
    });
  };

  const changeRoleHandler = () => {
    if (!showChangeRole) return;
    setOpenSetRole(true);
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" gap={2} alignItems="center">
          <Avatar>
            <User size={28} />
          </Avatar>
          <Typography variant="h6">Basic Details</Typography>
        </Stack>
      </CardContent>
      <MyCardContent>
        <UserInfoCardItem title="User Id" content={user.co_user_id} />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Name"
          content={
            userNameFormatter(user.firstName, user.lastName, user.otherName) +
            (isYou ? " (You)" : "")
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="NIN"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {"Not Available"}&ensp;
              <Chip
                variant="outlined"
                label="Open"
                size="small"
                color="primary"
                sx={{ cursor: "pointer" }}
                onClick={openNinHandler}
              />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="Date Of Birth" content={"Not Available"} />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Role"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {capitalizeFirstLetter(user.role.role)}&ensp;
              {showChangeRole && (
                <Chip
                  variant="outlined"
                  label="Change Role"
                  size="small"
                  color="primary"
                  sx={{ cursor: "pointer" }}
                  onClick={changeRoleHandler}
                />
              )}
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Email"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {user.email}&ensp;
              <VerifiedChip isVerified={user.email_verified === 1} />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Phone"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {formatDisplayedPhoneNumber(user.phone_number)}&ensp;
              <VerifiedChip isVerified={user.phone_verified === 1} />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Account Status"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {capitalizeFirstLetter(user.status.status)}&ensp;
              <UserStatusChip status={user.status} />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Created At"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {fDateTime12(user.created_at)}&ensp;
              <Chip
                variant="outlined"
                label={capitalizeFirstLetter(fToNow(user.created_at))}
                size="small"
                color="default"
                sx={{ cursor: "pointer" }}
              />
            </Typography>
          }
        />
      </MyCardContent>
      {openSetRole && (
        <SelectRoleDialog
          userRole={user.role}
          isOpen={openSetRole}
          setIsOpen={setOpenSetRole}
          userRoles={userRoles}
          userId={user.co_user_id}
          userName={userNameFormatter(
            user.firstName,
            user.lastName,
            user.otherName
          )}
        />
      )}
    </Card>
  );
};

export default UserBasicInfoCard;
