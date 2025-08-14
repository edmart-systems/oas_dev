"use client";

import { Stack, Typography } from "@mui/material";
import React from "react";
import { userNameFormatter } from "@/utils/formatters.util";
import { useSession } from "next-auth/react";
import QuotationStatusChip from "./quotation-status-chip";
import { QuotationStatusKey } from "@/types/quotations.types";
import { Quotation_status } from "@prisma/client";

type Props = {
  quotationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  status: Quotation_status;
  isExpired: boolean;
  isVariant?: boolean;
};

const QuotationPageHead = ({
  quotationId,
  userId,
  firstName,
  lastName,
  status,
  isExpired,
  isVariant,
}: Props) => {
  const { data: sessionData } = useSession();

  return (
    <Stack
      direction="row"
      gap={2}
      alignItems="center"
      sx={{ cursor: "pointer" }}
    >
      <Stack gap={0}>
        <Typography
          fontWeight={600}
          variant="h4"
          // fontSize="24px"
          alignItems="center"
        >
          {quotationId}
          {isVariant && " Variant"}&ensp;
          <QuotationStatusChip
            status={
              isExpired ? "expired" : (status.status as QuotationStatusKey)
            }
          />
        </Typography>
        <Typography variant="body1" color="textSecondary">
          &ensp;By {userNameFormatter(firstName, lastName)}{" "}
          {sessionData?.user.co_user_id === userId && "(You)"}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default QuotationPageHead;
