import { Chip } from "@mui/material";
import React from "react";
import { CheckCircle, RemoveCircle } from "@mui/icons-material";

type Props = {
  isVerified: boolean;
};

const VerifiedChip = ({ isVerified }: Props) => {
  return (
    <Chip
      color={isVerified ? "success" : "error"}
      icon={isVerified ? <CheckCircle /> : <RemoveCircle />}
      label={isVerified ? "Verified" : "Not Verified"}
      variant="outlined"
      size="small"
    />
  );
};

export default VerifiedChip;
