"use client";

import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";
import InventoryStatsCards from "@/components/dashboard/inventory/inventory-stats-cards";
import InventoryCharts from "@/components/dashboard/inventory/inventory-charts";
import RoleGuard from "@/components/dashboard/inventory/RoleGuard";
import { Stack } from "@mui/material";

const InventoryPage = () => {
  return (
    <RoleGuard>
      <Stack m={1}>
        <InventoryStatsCards />
        <InventoryCharts />
      </Stack>
    </RoleGuard>
  );
};

export default InventoryPage;