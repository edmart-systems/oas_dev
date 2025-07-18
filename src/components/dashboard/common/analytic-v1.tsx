"use client";

import {
  Avatar,
  Box,
  Card,
  Stack,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import React, { ReactElement } from "react";

type Props = {
  title: string;
  content: string;
  secondaryContent?: string;
  icon: ReactElement;
  isMui?: boolean;
};

export const analyticIconStyle = (theme: Theme, isMui?: boolean) => {
  return isMui
    ? {
        sx: {
          color: theme.palette.text.secondary,
          height: "30px",
          width: "30px",
        },
      }
    : {
        style: {
          color: theme.palette.text.secondary,
          height: "30px",
          width: "30px",
        },
      };
};

const AnalyticV1 = ({ title, content, secondaryContent, icon }: Props) => {
  const theme = useTheme();
  return (
    <Card sx={{ height: 108 }}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-start"
        alignItems="center"
        sx={{
          width: "100%",
          height: "100%",
          padding: "16px 24px",
          cursor: "pointer",
        }}
      >
        <Box>
          <Avatar
            sx={{
              bgcolor: theme.palette.background.default,
              height: "60px",
              width: "60px",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 5px 22px 0 rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255, 255, 255, 0.12)"
                  : "0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06)",
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Stack spacing={0}>
          <Typography variant="body2">{title}</Typography>
          <Typography variant="body1" fontWeight={600}>
            {content}
          </Typography>
          {secondaryContent && (
            <Typography variant="body2">{secondaryContent}</Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default AnalyticV1;
