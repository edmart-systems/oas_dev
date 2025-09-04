"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Stack,
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
  Chip
} from "@mui/material";
import CategoryMain from "@/components/dashboard/inventory/category/categoryMain";
import TagMain from "@/components/dashboard/inventory/tag/tagMain";
import ProductsMain from "@/components/dashboard/inventory/products/productMain";
import { Stack as PhosphorStack, Tag as TagIcon, StackSimple as CategoryIcon ,Warehouse, PackageIcon, UniteSquareIcon, ArrowsClockwiseIcon} from "@phosphor-icons/react";
import InventoryPointMain from "@/components/dashboard/inventory/inventoryPoint/inventoryPointMain";
import StockMain from "@/components/dashboard/inventory/stock/stockMain";
import { CurrencyEthIcon } from "@phosphor-icons/react/dist/ssr";
import UnitMain from "@/components/dashboard/inventory/units/UnitMain";
import CurrencyMain from "@/components/dashboard/inventory/units/CurrencyMain";
import TransfersMain from "@/components/dashboard/inventory/transfers/TransfersMain";
import InventoryStockMain from "@/components/dashboard/inventory/inventoryStock/InventoryStockMain";
import LocationMain from "@/components/dashboard/common/settings/location/LocationMain";


const CategoriesPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const colors = {
    primary: "#D98219",
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : "#ffffff",
    border: theme.palette.divider,
  };

  const tabs = [
    { id: 0, label: "Products", icon: <PhosphorStack size={20} /> },
    { id: 6, label: "Units", icon: <UniteSquareIcon size={20} /> },
    { id: 7, label: "Currencies", icon: <CurrencyEthIcon size={20} /> },
    { id: 1, label: "Tags", icon: <TagIcon size={20} /> },
    { id: 2, label: "Categories", icon: <CategoryIcon size={20} /> },
    { id: 3, label: "Inventory Point", icon: <Warehouse size={20} /> },
    { id: 4, label: "Stock", icon: <PackageIcon size={20} /> },
    { id: 8, label: "Inventory Stock", icon: <PackageIcon size={20} /> },
    { id: 5, label: "Transfers", icon: <ArrowsClockwiseIcon size={20} /> },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${alpha(colors.primary, 0.02)}, ${alpha(colors.surfaceVariant, 0.5)})`,
      p: 3 
    }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom color={colors.primary}>
            Manage Inventory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your products, categories, stock, and inventory settings
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 4,
          backgroundColor: alpha(colors.surface, 0.9),
          backdropFilter: 'blur(20px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          border: `1px solid ${alpha(colors.border, 0.1)}`,
        }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={tabValue === tab.id ? "contained" : "outlined"}
                startIcon={tab.icon}
                onClick={() => setTabValue(tab.id)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  ...(tabValue === tab.id ? {
                    backgroundColor: colors.primary,
                    boxShadow: `0 8px 20px ${alpha(colors.primary, 0.3)}`,
                    '&:hover': {
                      backgroundColor: alpha(colors.primary, 0.9),
                    }
                  } : {
                    borderColor: alpha(colors.primary, 0.3),
                    color: colors.primary,
                    '&:hover': {
                      borderColor: colors.primary,
                      backgroundColor: alpha(colors.primary, 0.05),
                    }
                  })
                }}
              >
                {tab.label}
              </Button>
            ))}

          </Stack>
        </Paper>

        {/* Content Area */}
        <Box>
          {tabValue === 0 && <ProductsMain />}
          {tabValue === 1 && <TagMain />}
          {tabValue === 2 && <CategoryMain />}
          {tabValue === 3 && <LocationMain />}
          {tabValue === 4 && <StockMain />}
          {tabValue === 5 && <TransfersMain />}
          {tabValue === 6 && <UnitMain />}
          {tabValue === 7 && <CurrencyMain />}
          {tabValue === 8 && <InventoryStockMain />}
        </Box>
      </Stack>
    </Box>
  );
};

export default CategoriesPage;