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
import { Files } from "@phosphor-icons/react/dist/ssr";
import React, { Fragment } from "react";

const MyCardContent = styled(CardContent)({
  paddingTop: "5px",
  paddingBottom: "5px",
});

const UserQuotesCard = () => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" gap={2} alignItems="center">
          <Avatar>
            <Files size={28} />
          </Avatar>
          <Typography variant="h6">User Quotations</Typography>
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

export default UserQuotesCard;
