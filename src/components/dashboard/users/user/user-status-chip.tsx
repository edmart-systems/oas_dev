import { Chip, Tooltip } from "@mui/material";
import React from "react";
import {
  CheckCircle,
  RemoveCircle,
  QueryBuilder,
  MotionPhotosOff,
} from "@mui/icons-material";
import { FullUser, UserStatus } from "@/types/user.types";
import { capitalizeFirstLetter } from "@/utils/formatters.util";

type Props = Pick<FullUser, "status">;

const roleConfig = {
  active: {
    icon: <CheckCircle color="success" />,
  },
  blocked: {
    icon: <RemoveCircle color="error" />,
  },
  pending: {
    icon: <QueryBuilder color="warning" />,
  },
  inactive: {
    icon: <MotionPhotosOff color="disabled" />,
  },
};

const UserStatusChip = ({ status }: Props) => {
  const statusName = capitalizeFirstLetter(status.status);

  return (
    <Tooltip title={status.status_desc}>
      <Chip
        color="default"
        icon={roleConfig[status.status as UserStatus].icon}
        label={statusName}
        variant="outlined"
        size="small"
      />
    </Tooltip>
  );
};

export default UserStatusChip;
