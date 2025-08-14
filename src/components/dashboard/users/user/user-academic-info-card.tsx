"use client";

import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import {
  CurrencyDollarSimple,
  GraduationCap,
} from "@phosphor-icons/react/dist/ssr";
import React from "react";
import UserInfoCardItem from "./user-info-card-item";
import { toast } from "react-toastify";
import { sxFlexRowSpaceBtn } from "@/utils/styles.utils";
import { MyCardContent } from "./user-basic-info-card";

const UserAcademicInfoCard = () => {
  const openNoItemHandler = (name: string) => {
    toast(name + " not available", {
      type: "info",
    });
  };
  return (
    <Card>
      <CardContent>
        <Stack direction="row" gap={2} alignItems="center">
          <Avatar>
            <GraduationCap size={28} />
          </Avatar>
          <Typography variant="h6">Work & Academic Documents</Typography>
        </Stack>
      </CardContent>
      <MyCardContent>
        <UserInfoCardItem
          title="CV"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {"Not Available"}&ensp;
              <Chip
                variant="outlined"
                label="Open"
                size="small"
                color="primary"
                sx={{ cursor: "pointer" }}
                onClick={() => openNoItemHandler("CV")}
              />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="University Transcripts"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {"Not Available"}&ensp;
              <Chip
                variant="outlined"
                label="Open"
                size="small"
                color="primary"
                sx={{ cursor: "pointer" }}
                onClick={() => openNoItemHandler("Transcript")}
              />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Certifications"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {"Not Available"}&ensp;
              <Chip
                variant="outlined"
                label="Open"
                size="small"
                color="primary"
                sx={{ cursor: "pointer" }}
                onClick={() => openNoItemHandler("Certifications")}
              />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="High School Transcripts"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {"Not Available"}&ensp;
              <Chip
                variant="outlined"
                label="Open"
                size="small"
                color="primary"
                sx={{ cursor: "pointer" }}
                onClick={() => openNoItemHandler("Transcripts")}
              />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="New Document"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {"Add A Document"}&ensp;
              <Chip
                variant="outlined"
                label="Add"
                size="small"
                color="primary"
                sx={{ cursor: "pointer" }}
                onClick={() => {}}
              />
            </Typography>
          }
        />
      </MyCardContent>
    </Card>
  );
};

export default UserAcademicInfoCard;
