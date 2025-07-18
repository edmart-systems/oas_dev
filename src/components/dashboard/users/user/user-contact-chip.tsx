import { Chip, Tooltip } from "@mui/material";
import React from "react";
import { Verified, NewReleases } from "@mui/icons-material";

type Props = {
  contact: string;
  verified: boolean;
  name: string;
};

const UserContactChip = ({ contact, verified, name }: Props) => {
  return (
    <Tooltip title={verified ? `${name} Verified` : `${name} Not Verified`}>
      <Chip
        color="default"
        icon={
          verified ? (
            <Verified color="success" />
          ) : (
            <NewReleases color="warning" />
          )
        }
        label={contact}
        variant="outlined"
        // size="small"
      />
    </Tooltip>
  );
};

export default UserContactChip;
