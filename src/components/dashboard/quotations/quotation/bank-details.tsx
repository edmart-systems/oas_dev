import { BankDto } from "@/types/company.types";
import { Stack, Typography } from "@mui/material";
import React from "react";

type Props = {
  bank: BankDto;
};

const BankDetails = ({ bank }: Props) => {
  return (
    <Stack>
      <Stack direction="row">
        <Typography variant="body1" fontWeight={600} flex={1}>
          Title:
        </Typography>
        <Typography variant="body1" flex={5}>
          {bank.ac_title}
        </Typography>
      </Stack>
      <Stack direction="row">
        <Typography variant="body1" fontWeight={600} flex={1}>
          A/C No:
        </Typography>
        <Typography variant="body1" flex={5}>
          {bank.ac_number}
        </Typography>
      </Stack>
      <Stack direction="row">
        <Typography variant="body1" fontWeight={600} flex={1}>
          Bank:
        </Typography>
        <Typography variant="body1" flex={5}>
          {bank.name}
        </Typography>
      </Stack>
      <Stack direction="row">
        <Typography variant="body1" fontWeight={600} flex={1}>
          Branch:
        </Typography>
        <Typography variant="body1" flex={5}>
          {bank.branch_name}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default BankDetails;
