"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Stack,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
} from "@mui/material";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

const AlertsPage = () => {
  const [open, setOpen] = useState(false);

  type AlertType = "low_stock" | "stockout" | "overstock";
  type Alert = {
    type: AlertType;
    product_id: number;
    product_name: string;
    inventory_point_id: number;
    inventory_point: string;
    quantity: number;
    min?: number | null;
    max?: number | null;
    message: string;
  };

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<AlertType[]>([]);
  const [inventoryPoints, setInventoryPoints] = useState<
    { inventory_point_id: number; inventory_point: string }[]
  >([]);
  const [selectedPoint, setSelectedPoint] = useState<number | "">("");

  const typeOptions: { label: string; value: AlertType; color: "warning" | "error" | "info" }[] = [
    { label: "Low stock", value: "low_stock", color: "warning" },
    { label: "Stockout", value: "stockout", color: "error" },
    { label: "Overstock", value: "overstock", color: "info" },
  ];

  const fetchInventoryPoints = async () => {
    try {
      const res = await fetch("/api/inventory/inventory_point");
      if (!res.ok) throw new Error("Failed to load inventory points");
      const data = await res.json();
      setInventoryPoints(
        (data || []).map((d: any) => ({
          inventory_point_id: d.inventory_point_id,
          inventory_point: d.inventory_point,
        }))
      );
    } catch (e: any) {
      // Non-fatal for the page; filters just won't show
      console.error(e);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedTypes.length) params.set("type", selectedTypes.join(","));
      if (selectedPoint) params.set("inventory_point_id", String(selectedPoint));

      const res = await fetch(`/api/inventory/alerts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryPoints();
  }, []);

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypes, selectedPoint]);

  const counts = useMemo(() => {
    return typeOptions.reduce<Record<AlertType, number>>((acc, t) => {
      acc[t.value] = alerts.filter((a) => a.type === t.value).length as number;
      return acc;
    }, { low_stock: 0, stockout: 0, overstock: 0 });
  }, [alerts]);

  return (
    <Stack spacing={2}>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Alert Rules"
              action={<Button variant="contained" onClick={() => setOpen(true)}>New Rule</Button>}
            />
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Rules coming soon. For now, alerts are computed from product min/max and inventory stock.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {typeOptions.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={`${opt.label}: ${counts[opt.value]}`}
                      color={opt.color}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Alerts Feed" />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="alert-type-label">Alert type</InputLabel>
                    <Select
                      labelId="alert-type-label"
                      label="Alert type"
                      multiple
                      value={selectedTypes}
                      onChange={(e) => setSelectedTypes(e.target.value as AlertType[])}
                      renderValue={(selected) => (
                        <Stack direction="row" gap={0.5} flexWrap="wrap">
                          {(selected as AlertType[]).map((v) => (
                            <Chip key={v} label={typeOptions.find((t) => t.value === v)?.label || v} size="small" />
                          ))}
                        </Stack>
                      )}
                    >
                      {typeOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          <Checkbox checked={selectedTypes.indexOf(opt.value) > -1} />
                          <Typography>{opt.label}</Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel id="inv-point-label">Inventory point</InputLabel>
                    <Select
                      labelId="inv-point-label"
                      label="Inventory point"
                      value={selectedPoint}
                      onChange={(e) => setSelectedPoint(e.target.value as number | "")}
                    >
                      <MenuItem value="">
                        <em>All points</em>
                      </MenuItem>
                      {inventoryPoints.map((p) => (
                        <MenuItem key={p.inventory_point_id} value={p.inventory_point_id}>
                          {p.inventory_point}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ flex: 1 }} />
                  <Button variant="outlined" onClick={fetchAlerts}>Refresh</Button>
                </Stack>

                {loading ? (
                  <Stack alignItems="center" py={4}>
                    <CircularProgress size={24} />
                  </Stack>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : alerts.length === 0 ? (
                  <Typography color="text.secondary">No alerts.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Inventory point</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Min</TableCell>
                        <TableCell align="right">Max</TableCell>
                        <TableCell>Message</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerts.map((a, idx) => (
                        <TableRow key={`${a.product_id}-${a.inventory_point_id}-${idx}`} hover>
                          <TableCell width={120}>
                            <Chip
                              size="small"
                              color={
                                a.type === "stockout" ? "error" : a.type === "low_stock" ? "warning" : "info"
                              }
                              label={
                                a.type === "stockout" ? "Stockout" : a.type === "low_stock" ? "Low stock" : "Overstock"
                              }
                            />
                          </TableCell>
                          <TableCell>{a.product_name}</TableCell>
                          <TableCell>{a.inventory_point}</TableCell>
                          <TableCell align="right">{a.quantity}</TableCell>
                          <TableCell align="right">{a.min ?? "-"}</TableCell>
                          <TableCell align="right">{a.max ?? "-"}</TableCell>
                          <TableCell sx={{ maxWidth: 380 }}>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {a.message}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Alert Rule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" fullWidth size="small" />
            <TextField label="Type (e.g., low_stock, stockout, aging)" fullWidth size="small" />
            <TextField label="Threshold JSON" placeholder='{"reorder_point":10}' fullWidth size="small" />
            <TextField label="Scope JSON" placeholder='{"product_ids":[1,2],"inventory_point_ids":[1]}' fullWidth size="small" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Enable email notifications" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AlertsPage;
