'use client';

import { Stack } from "@mui/material";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

interface InventoryLayoutProps {
  title: string;
  children: React.ReactNode;
}

const InventoryLayout = ({ title, children }: InventoryLayoutProps) => {
  return (
    <Stack spacing={3}>
      <PageTitle title={title} />
      <InventoryHorizontalNav />
      {children}
    </Stack>
  );
};

export default InventoryLayout;