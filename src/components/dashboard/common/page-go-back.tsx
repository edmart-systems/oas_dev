"use client";

import { West } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import nProgress from "nprogress";
import React from "react";
import { useQuotationNavigation } from "@/hooks/use-quotation-navigation";
import { paths } from "@/utils/paths.utils";

type Props = {
  backName?: string;
  link?: string;
};

const PageGoBack = ({ backName, link }: Props) => {
  const router = useRouter();
  const { navigateBackToQuotations } = useQuotationNavigation();

  const backHandler = () => {
    nProgress.start();
    
    // Check if we're going back to quotations and use preserved state
    if (link === paths.dashboard.quotations.main || 
        (backName && (backName.toLowerCase().includes('quotation') || backName.toLowerCase().includes('quotations')))) {
      navigateBackToQuotations();
    } else {
      backName && link ? router.push(link) : router.back();
    }
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
