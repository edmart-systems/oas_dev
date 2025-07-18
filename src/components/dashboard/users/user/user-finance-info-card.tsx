"use client";

import {
  Avatar,
  Card,
  CardContent,
  Divider,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { CurrencyDollarSimple } from "@phosphor-icons/react/dist/ssr";
import React from "react";
import UserInfoCardItem from "./user-info-card-item";
import { MyCardContent } from "./user-basic-info-card";

const UserFinanceInfoCard = () => {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" gap={2} alignItems="center">
          <Avatar>
            <CurrencyDollarSimple size={28} />
          </Avatar>
          <Typography variant="h6">Financial Details</Typography>
        </Stack>
      </CardContent>
      <MyCardContent>
        <UserInfoCardItem title="TIN" content="Not Available" />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="NSSF Number" content="Not Available" />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="Bank Name" content="Not Available" />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="Bank Branch" content="Not Available" />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="Bank Account Number" content="Not Available" />
      </MyCardContent>
    </Card>
  );
};

export default UserFinanceInfoCard;
