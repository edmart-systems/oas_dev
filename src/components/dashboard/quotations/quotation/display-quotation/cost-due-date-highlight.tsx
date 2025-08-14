import { Currency2 } from "@/types/currency.types";
import { fDateDdMmmYyyy } from "@/utils/time.utils";
import { Typography } from "@mui/material";
import React from "react";

type Props = {
  currency: Currency2;
  total: number;
  dueDate: number;
};

const CostDueDateHighlight = ({ currency, dueDate, total }: Props) => {
  return (
    <Typography variant="body1" fontSize="larger" fontWeight={600}>
      {currency.currency_code} {total.toLocaleString()} due{" "}
      {fDateDdMmmYyyy(dueDate)}
    </Typography>
  );
};

export default CostDueDateHighlight;
