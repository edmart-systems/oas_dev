"use client";

import { Card, CardContent, CardHeader, Grid, Box, Typography } from "@mui/material";
import { useAppSelector } from "@/redux/store";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const InventoryCharts = () => {
  const { mode } = useAppSelector((state) => state.theme);

  // Live Sales Trend state (last 6 months, grouped by month)
  const [salesCats, setSalesCats] = useState<string[]>(["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
  const [salesVals, setSalesVals] = useState<number[]>([45000, 52000, 48000, 61000, 55000, 67000]);
  const [salesLoading, setSalesLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        setSalesLoading(true);
        const today = new Date();
        const from = new Date(today);
        from.setMonth(from.getMonth() - 5); // include this month and previous 5
        from.setDate(1);
        const to = new Date(today);
        const params = new URLSearchParams({
          from: from.toISOString().slice(0, 10),
          to: to.toISOString().slice(0, 10),
          groupBy: "month",
        });
        const res = await fetch(`/api/inventory/analytics/sales-trend?${params.toString()}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch sales trend");
        const rows: { period: string; total_amount: number }[] = await res.json();
        // Ensure months are continuous across the 6-month window
        const months: string[] = [];
        const values: number[] = [];
        const idx: Record<string, number> = {};
        for (const r of rows) idx[r.period] = r.total_amount ?? 0;
        const cursor = new Date(from);
        for (let i = 0; i < 6; i++) {
          const y = cursor.getFullYear();
          const m = String(cursor.getMonth() + 1).padStart(2, "0");
          const key = `${y}-${m}`;
          months.push(key);
          values.push(idx[key] ?? 0);
          cursor.setMonth(cursor.getMonth() + 1);
        }
        setSalesCats(months);
        setSalesVals(values);
      } catch (e) {
        // keep defaults on error
      } finally {
        setSalesLoading(false);
      }
    };
    load();
  }, []);

  const stockLevelsOptions = {
    chart: {
      toolbar: { show: false },
    },
    colors: ["#1976d2", "#ed6c02", "#2e7d32"],
    xaxis: {
      categories: ["Electronics", "Clothing", "Books", "Home", "Sports"],
      labels: { style: { colors: mode === "dark" ? "#ffffff" : "#000000" } },
    },
    yaxis: {
      labels: { style: { colors: mode === "dark" ? "#ffffff" : "#000000" } },
    },
    legend: {
      labels: { colors: mode === "dark" ? "#ffffff" : "#000000" },
    },
    plotOptions: {
      bar: { columnWidth: "60%" },
    },
  };

  const stockLevelsSeries = [
    { name: "In Stock", data: [850, 1200, 650, 900, 750] },
    { name: "Low Stock", data: [45, 23, 12, 34, 28] },
    { name: "Out of Stock", data: [15, 8, 5, 12, 9] },
  ];

  const salesTrendOptions = {
    chart: {
      toolbar: { show: false },
    },
    colors: [mode === "dark" ? "#FFB84D" : "#D98219"],
    stroke: { curve: "smooth" as "smooth", width: 4 },
    xaxis: {
      categories: salesCats,
      labels: { style: { colors: mode === "dark" ? "#ffffff" : "#000000" } },
    },
    yaxis: {
      labels: { style: { colors: mode === "dark" ? "#ffffff" : "#000000" } },
    },
    legend: {
      labels: { colors: mode === "dark" ? "#ffffff" : "#000000" },
    },
    grid: {
      borderColor: mode === "dark" ? "#444" : "#e0e0e0",
    },
  };

  const salesTrendSeries = [
    { name: salesLoading ? "Sales (Loading)" : "Sales", data: salesVals },
  ];

  const purchaseTrendOptions = {
    chart: {
      toolbar: { show: false },
    },
    colors: [mode === "dark" ? "#66BB6A" : "#2e7d32"],
    stroke: { curve: "smooth" as "smooth", width: 4 },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      labels: { style: { colors: mode === "dark" ? "#ffffff" : "#000000" } },
    },
    yaxis: {
      labels: { style: { colors: mode === "dark" ? "#ffffff" : "#000000" } },
    },
    legend: {
      labels: { colors: mode === "dark" ? "#ffffff" : "#000000" },
    },
    grid: {
      borderColor: mode === "dark" ? "#444" : "#e0e0e0",
    },
  };

  const purchaseTrendSeries = [
    { name: "Purchases", data: [32000, 38000, 35000, 42000, 39000, 45000] },
  ];

  const categoryDistributionOptions = {
    colors: ["#1976d2", "#ed6c02", "#2e7d32", "#9c27b0", "#f44336"],
    labels: ["Electronics", "Clothing", "Books", "Home", "Sports"],
    legend: { 
      position: "bottom" as "bottom",
      labels: { colors: mode === "dark" ? "#ffffff" : "#000000" },
    },
  };

  const categoryDistributionSeries = [35, 25, 15, 15, 10];

  return (
    <Grid container spacing={3} mt={1}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="Stock Levels by Category" />
          <CardContent>
            <Chart
              options={stockLevelsOptions}
              series={stockLevelsSeries}
              type="bar"
              height={300}
            />
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Category Distribution" />
          <CardContent>
            <Chart
              options={categoryDistributionOptions}
              series={categoryDistributionSeries}
              type="donut"
              height={300}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Sales Trend (Last 6 Months)" />
          <CardContent>
            <Chart
              options={salesTrendOptions}
              series={salesTrendSeries}
              type="line"
              height={300}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Purchase Trend (Last 6 Months)" />
          <CardContent>
            <Chart
              options={purchaseTrendOptions}
              series={purchaseTrendSeries}
              type="line"
              height={300}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default InventoryCharts;