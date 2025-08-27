"use client";

import { Stack, Card, CardHeader, CardContent, Grid, Typography } from "@mui/material";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";
import InventoryCharts from "@/components/dashboard/inventory/inventory-charts";
import { useEffect, useState } from "react";
import { Warning, ShoppingCart, Package } from "@phosphor-icons/react";

const InventoryAnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{
    valuation: number;
    low_stock_count: number;
    out_of_stock_rate: number;
    sales_period_amount: number;
  } | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/inventory/analytics/summary", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load analytics summary");
        const data = await res.json();
        setSummary(data);
      } catch (e) {
        // noop for now; page shows placeholders when null
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const kpi = summary || { valuation: 0, low_stock_count: 0, out_of_stock_rate: 0, sales_period_amount: 0 };
  const fmt = (n: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n ?? 0);
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  return (
    <Stack spacing={2}>

      {/* Live KPIs */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack>
                  <Typography variant="body2" color="text.secondary">Inventory Valuation</Typography>
                  <Typography variant="h5">${fmt(kpi.valuation)}</Typography>
                </Stack>
                <Package size={22} />
              </Stack>
              {loading && <Typography variant="caption" color="text.secondary">Loading…</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack>
                  <Typography variant="body2" color="text.secondary">Low Stock Items</Typography>
                  <Typography variant="h5">{fmt(kpi.low_stock_count)}</Typography>
                </Stack>
                <Warning size={22} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack>
                  <Typography variant="body2" color="text.secondary">Out-of-Stock Rate</Typography>
                  <Typography variant="h5">{pct(kpi.out_of_stock_rate)}</Typography>
                </Stack>
                <Package size={22} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack>
                  <Typography variant="body2" color="text.secondary">Sales (Period)</Typography>
                  <Typography variant="h5">${fmt(kpi.sales_period_amount)}</Typography>
                </Stack>
                <ShoppingCart size={22} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <InventoryCharts />

      {/* Tables */}
      <Grid container spacing={3} mt={0}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Low Stock Items" subheader="Products at or below reorder point" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Placeholder table. To be powered by /api/inventory/analytics/low-stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Slow Movers" subheader="No sales in the selected period" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Placeholder table. To be powered by /api/inventory/analytics/slow-movers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default InventoryAnalyticsPage;
