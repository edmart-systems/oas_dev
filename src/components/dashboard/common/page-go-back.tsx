"use client";

import { West } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import nProgress from "nprogress";
import React from "react";

type Props = {
  backName?: string;
  link?: string;
};

const PageGoBack = ({ backName, link }: Props) => {
  const router = useRouter();

  const backHandler = () => {
    nProgress.start();
    backName && link ? router.push(link) : router.back();
  };

  return (
    <Stack direction="row" gap={1} alignItems="center">
      <West sx={{ width: "20px", cursor: "pointer" }} onClick={backHandler} />
      <Typography
        variant="body2"
        onClick={backHandler}
        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
      >
        {backName ? backName : "Go Back"}
      </Typography>
    </Stack>
  );
};

export default PageGoBack;
