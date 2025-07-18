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
import { Invoice } from "@phosphor-icons/react/dist/ssr";
import React, { Fragment } from "react";
import { MyCardContent } from "./user-basic-info-card";

const UserInvoicesCard = () => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" gap={2} alignItems="center">
          <Avatar>
            <Invoice size={28} />
          </Avatar>
          <Typography variant="h6">User Invoices</Typography>
        </Stack>
      </CardContent>
      <MyCardContent>
        &ensp;
        <br />
        &ensp;
      </MyCardContent>
      {Array.from(Array(6)).map((item, index) => {
        return (
          <Fragment key={item + "" + index}>
            <Divider />
            <MyCardContent>
              &ensp;
              <br />
              &ensp;
            </MyCardContent>
          </Fragment>
        );
      })}
    </Card>
  );
};

export default UserInvoicesCard;
