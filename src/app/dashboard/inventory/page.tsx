import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";
import InventoryStatsCards from "@/components/dashboard/inventory/inventory-stats-cards";
import InventoryCharts from "@/components/dashboard/inventory/inventory-charts";
import { Stack } from "@mui/material";

const InventoryPage = () => {
  return (
    <Stack spacing={3} direction={"column"}>
      
      <InventoryStatsCards />
      <InventoryCharts />
      
      
    </Stack>
  );
};

export default InventoryPage;