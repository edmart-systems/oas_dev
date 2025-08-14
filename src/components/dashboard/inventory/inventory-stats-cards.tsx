"use client";

import { Box, Card, CardContent, Grid, Typography, Stack } from "@mui/material";
import { TrendUp, TrendDown, Package, ShoppingCart, Users, Warning } from "@phosphor-icons/react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard = ({ title, value, change, icon, color = "primary.main" }: StatCardProps) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {change !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {change >= 0 ? (
                <TrendUp size={16} color="#4caf50" />
              ) : (
                <TrendDown size={16} color="#f44336" />
              )}
              <Typography
                variant="caption"
                color={change >= 0 ? "success.main" : "error.main"}
              >
                {Math.abs(change)}%
              </Typography>
            </Stack>
          )}
        </Stack>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const InventoryStatsCards = () => {
  const statsData = [
    {
      title: "Total Products",
      value: "2,847",
      change: 12.5,
      icon: <Package size={24} color="white" />,
      color: "#1976d2",
    },
    {
      title: "Low Stock Items",
      value: "23",
      change: -8.2,
      icon: <Warning size={24} color="white" />,
      color: "#ed6c02",
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: 15.3,
      icon: <ShoppingCart size={24} color="white" />,
      color: "#2e7d32",
    },
    {
      title: "Active Suppliers",
      value: "156",
      change: 5.7,
      icon: <Users size={24} color="white" />,
      color: "#9c27b0",
    },
  ];

  return (
    <Grid container spacing={3}>
      {statsData.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default InventoryStatsCards;