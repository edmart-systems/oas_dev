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
import { Users } from "@phosphor-icons/react/dist/ssr";
import React from "react";
import UserInfoCardItem from "./user-info-card-item";
import { MyCardContent } from "./user-basic-info-card";

const UserKinInfoCard = () => {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" gap={2} alignItems="center">
          <Avatar>
            <Users size={28} />
          </Avatar>
          <Typography variant="h6">Next Of Kin</Typography>
        </Stack>
      </CardContent>
      <MyCardContent>
        <UserInfoCardItem title="Name" content="Not Available" />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="Relationship" content="Not Available" />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="Email" content="Not Available" />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="Phone" content="Not Available" />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="Address" content="Not Available" />
      </MyCardContent>
    </Card>
  );
};

export default UserKinInfoCard;
