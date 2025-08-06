'use client';

import { Stack } from "@mui/material";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Stack>
      <InventoryHorizontalNav />
      {children}
    </Stack>
  );
}