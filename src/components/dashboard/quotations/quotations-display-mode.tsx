"use client";

import { paths } from "@/utils/paths.utils";
import { Card, IconButton, Tooltip } from "@mui/material";
import { List, Rows } from "@phosphor-icons/react/dist/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import nProgress from "nprogress";
import React from "react";

const QuotationsDisplayMode = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const viewParams = searchParams.get("view");
  const setParams = (viewMode: number) => {
    if (
      (viewMode === 0 && viewParams === "list") ||
      (viewMode === 1 && viewParams === "group")
    ) {
      return;
    }
    // 1 => group
    // 0 => List
    router.push(paths.dashboard.quotations.main);
    const newParams = new URLSearchParams();

    newParams.append("sort", "desc");

    if (viewMode === 1) {
      newParams.append("view", "group");
    } else if (viewMode === 0) {
      newParams.append("view", "list");
    }

    nProgress.start();
    router.push(paths.dashboard.quotations.main + `?${newParams.toString()}`);
  };

  return (
    <Card sx={{ padding: "2px 10px" }}>
      <Tooltip title="Grouped" arrow>
        <IconButton
          color={viewParams == "group" ? "primary" : undefined}
          onClick={() => setParams(1)}
        >
          <Rows />
        </IconButton>
      </Tooltip>
      <Tooltip title="List" arrow>
        <IconButton
          color={!viewParams || viewParams == "list" ? "primary" : undefined}
          onClick={() => setParams(0)}
        >
          <List />
        </IconButton>
      </Tooltip>
    </Card>
  );
};

export default QuotationsDisplayMode;
