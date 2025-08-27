"use client";

import { Stack, Card, CardHeader, CardContent, Grid, Button, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useMemo, useState } from "react";

const ReportsPage = () => {
  const [reportType, setReportType] = useState("sales-summary");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [invPointIdsText, setInvPointIdsText] = useState<string>("");
  const [productIdsText, setProductIdsText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Array<{ date: string; total_amount: number; transactions: number }>>([]);
  const [summary, setSummary] = useState<{ total_amount: number; transactions: number } | null>(null);

  const canRun = useMemo(() => !!reportType, [reportType]);

  const parseIds = (txt: string) =>
    txt
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));

  const handleRun = async () => {
    try {
      setLoading(true);
      setRows([]);
      setSummary(null);
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const invIds = parseIds(invPointIdsText);
      if (invIds.length) params.inventory_point_ids = invIds;
      const prodIds = parseIds(productIdsText);
      if (prodIds.length) params.product_ids = prodIds;

      const res = await fetch("/api/inventory/reports/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_type: reportType, params }),
      });
      if (!res.ok) throw new Error("Failed to run report");
      const data = (await res.json()) as { rows: { date: string; total_amount: number; transactions: number }[]; meta?: { summary?: { total_amount: number; transactions: number } } };
      setRows(data.rows || []);
      setSummary(data.meta?.summary || null);
    } catch (e) {
      // TODO: toast
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ["date", "total_amount", "transactions"]; 
    const lines = [headers.join(",")].concat(
      rows.map((r) => [r.date, String(r.total_amount), String(r.transactions)].join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={2}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Report Builder" />
            <CardContent>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Report Type</InputLabel>
                  <Select label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <MenuItem value="sales-summary">Sales Summary</MenuItem>
                    <MenuItem value="purchase-summary">Purchase Summary</MenuItem>
                    <MenuItem value="inventory-valuation">Inventory Valuation</MenuItem>
                    <MenuItem value="stock-movement">Stock Movement</MenuItem>
                    <MenuItem value="aging-inventory">Aging Inventory</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="From" type="date" slotProps={{ inputLabel: { shrink: true } }} size="small" fullWidth value={from} onChange={(e) => setFrom(e.target.value)} />
                <TextField label="To" type="date" slotProps={{ inputLabel: { shrink: true } }} size="small" fullWidth value={to} onChange={(e) => setTo(e.target.value)} />
                <TextField label="Inventory Point IDs (comma separated)" size="small" fullWidth value={invPointIdsText} onChange={(e) => setInvPointIdsText(e.target.value)} />
                <TextField label="Product IDs (comma separated)" size="small" fullWidth value={productIdsText} onChange={(e) => setProductIdsText(e.target.value)} />
                <Box display="flex" gap={1} alignItems="center">
                  <Button variant="contained" disabled={!canRun || loading} onClick={handleRun}>
                    {loading ? <CircularProgress size={20} /> : "Run"}
                  </Button>
                  <Button disabled={!rows.length} onClick={handleExportCsv}>Export CSV</Button>
                  <Button disabled>Export XLSX</Button>
                  <Button disabled>Export PDF</Button>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Sales Summary supported. More report types coming soon.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Results" />
            <CardContent>
              {loading && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">Running report…</Typography>
                </Box>
              )}
              {!!summary && (
                <Box mb={2}>
                  <Typography variant="subtitle2">Summary</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount: {summary.total_amount.toLocaleString()} | Transactions: {summary.transactions.toLocaleString()}
                  </Typography>
                </Box>
              )}
              {rows.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Total Amount</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.date}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell align="right">{r.total_amount.toLocaleString()}</TableCell>
                        <TableCell align="right">{r.transactions.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No data. Choose filters and run a report.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ReportsPage;
