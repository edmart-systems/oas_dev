"use client";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import React, { ReactElement } from "react";

type Props = {
  title: string;
  content: string | ReactElement;
};

const UserInfoCardItem = ({ title, content }: Props) => {
  const theme = useTheme();
  return (
    <Stack gap={0}>
      <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
        {title}
      </Typography>

      {typeof content === "string" ? (
        <Typography variant="body1" fontWeight={600} letterSpacing={1}>
          {content}
        </Typography>
      ) : (
        <Box sx={{ width: "100%" }}>{content}</Box>
      )}
    </Stack>
  );
};

export default UserInfoCardItem;
