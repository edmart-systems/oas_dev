"use client";

import { Box, Stack, Typography } from "@mui/material";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { inventoryIcons } from "./inventory-icons";
import { paths } from "@/utils/paths.utils";

interface InventoryNavItem {
  key: string;
  title: string;
  href: string;
  icon: keyof typeof inventoryIcons;
}

const inventoryNavItems: InventoryNavItem[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    href: paths.dashboard.inventory.main,
    icon: "dashboard",
  },
  {
    key: "sales",
    title: "Sales",
    href: `${paths.dashboard.inventory.main}/sales`,
    icon: "sales",
  },
  {
    key: "manage",
    title: "Manage Inventory",
    href: `${paths.dashboard.inventory.main}/manageInventory`,
    icon: "manage",
  },
  // {
  //   key: "products",
  //   title: "Products",
  //   href: `${paths.dashboard.inventory.main}/products`,
  //   icon: "products",
  // },
  {
    key: "stock",
    title: "Stock",
    href: `${paths.dashboard.inventory.main}/stock`,
    icon: "stock",
  },
  {
    key: "purchase",
    title: "Purchase",
    href: `${paths.dashboard.inventory.main}/purchase`,
    icon: "purchase",
  },
  {
    key: "orders",
    title: "Orders",
    href: `${paths.dashboard.inventory.main}/orders`,
    icon: "orders",
  },
  {
    key: "suppliers",
    title: "Suppliers",
    href: `${paths.dashboard.inventory.main}/suppliers`,
    icon: "suppliers",
  },
  {
    key: "customers",
    title: "Customers",
    href: `${paths.dashboard.inventory.main}/customers`,
    icon: "customers",
  },
  {
    key: "warehouse",
    title: "Warehouse",
    href: `${paths.dashboard.inventory.main}/warehouse`,
    icon: "warehouse",
  },
  {
    key: "transfers",
    title: "Transfers",
    href: `${paths.dashboard.inventory.main}/transfers`,
    icon: "transfers",
  },
  // {
  //   key: "categories",
  //   title: "Categories",
  //   href: `${paths.dashboard.inventory.main}/categories`,
  //   icon: "categories",
  // },
  {
    key: "analytics",
    title: "Analytics",
    href: `${paths.dashboard.inventory.main}/analytics`,
    icon: "analytics",
  },
  {
    key: "alerts",
    title: "Alerts",
    href: `${paths.dashboard.inventory.main}/alerts`,
    icon: "alerts",
  },
  {
    key: "reports",
    title: "Reports",
    href: `${paths.dashboard.inventory.main}/reports`,
    icon: "reports",
  },
  
];

const InventoryHorizontalNav = () => {
  const pathname = usePathname();
  const { mode: themeMode } = useAppSelector((state) => state.theme);

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        mb: 3,
      }}
    >
      <Stack
        direction="row"
        spacing={0}
        sx={{
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: 2,
          },
        }}
      >
        {inventoryNavItems.map((item) => {
          const Icon = inventoryIcons[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Box
              key={item.key}
              component={RouterLink}
              href={item.href}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                p: 2,
                minWidth: 100,
                textDecoration: "none",
                borderBottom: 2,
                borderColor: isActive ? "primary.main" : "transparent",
                color: isActive ? "primary.main" : "text.secondary",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                },
              }}
            >
              <Icon
                size={24}
                weight={isActive ? "fill" : "regular"}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isActive ? 600 : 400,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {item.title}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default InventoryHorizontalNav;