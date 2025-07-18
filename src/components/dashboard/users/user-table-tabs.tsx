"use client";

import React, {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { Chip, Tabs } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { UserStatus, UserStatusCounts } from "@/types/user.types";
import { paths } from "@/utils/paths.utils";
import nProgress from "nprogress";

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `user-filter-tabpanel-${index}`,
  };
};

type Props = {
  selectedTab: number;
  setSelectedTab: Dispatch<SetStateAction<number>>;
  statusCounts: UserStatusCounts;
};

const tabNumberStatusMap: Record<number, UserStatus | null> = {
  0: null,
  1: "active",
  2: "pending",
  3: "blocked",
  4: "inactive",
};

const UserTableTabs = ({
  selectedTab,
  setSelectedTab,
  statusCounts,
}: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { active, all, blocked, pending, inactive } = statusCounts;

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setSearchParams(tabNumberStatusMap[newValue]);
  };

  const setSearchParams = (status: UserStatus | null) => {
    if (!status) {
      const currentParams = new URLSearchParams(searchParams as any);
      currentParams.delete("status");
      nProgress.start();
      router.push(`${paths.dashboard.users.main}?${currentParams.toString()}`);
      return;
    }

    const currentParams = new URLSearchParams(searchParams as any);
    if (currentParams.has("status")) {
      currentParams.delete("status");
      currentParams.append("status", status);
    } else {
      currentParams.append("status", status);
    }
    nProgress.start();
    router.push(`${paths.dashboard.users.main}?${currentParams.toString()}`);
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderBottom: 0.5,
        borderColor: "divider",
      }}
    >
      <Tabs value={selectedTab} onChange={handleChange}>
        <Tab
          disableRipple
          label="All"
          icon={all > 0 ? <Chip label={all} size="small" /> : undefined}
          iconPosition="end"
          {...a11yProps(0)}
          sx={{
            textTransform: "none",
          }}
        />
        <Tab
          disableRipple
          label="Active"
          icon={active > 0 ? <Chip label={active} size="small" /> : undefined}
          iconPosition="end"
          {...a11yProps(1)}
          sx={{
            textTransform: "none",
          }}
        />
        <Tab
          disableRipple
          label="Pending"
          icon={pending > 0 ? <Chip label={pending} size="small" /> : undefined}
          iconPosition="end"
          {...a11yProps(2)}
          sx={{ textTransform: "none" }}
        />
        <Tab
          disableRipple
          label="Blocked"
          icon={blocked > 0 ? <Chip label={blocked} size="small" /> : undefined}
          iconPosition="end"
          {...a11yProps(3)}
          sx={{ textTransform: "none" }}
        />
        <Tab
          disableRipple
          label="Inactive"
          icon={
            inactive > 0 ? <Chip label={inactive} size="small" /> : undefined
          }
          iconPosition="end"
          {...a11yProps(4)}
          sx={{ textTransform: "none" }}
        />
      </Tabs>
    </Box>
  );
};

export default UserTableTabs;
