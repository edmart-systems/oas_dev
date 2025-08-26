import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Chip,
} from "@mui/material";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import MyCircularProgress from "@/components/common/my-circular-progress";

interface InventoryStockRow {
  product_id: number;
  inventory_point_id: number;
  quantity: number;
  product: { product_id: number; product_name: string } | null;
  inventory_point: { inventory_point_id: number; inventory_point: string } | null;
}

const InventoryStockMain: React.FC = () => {
  const [rows, setRows] = useState<InventoryStockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/inventory_stock");
      if (!res.ok) throw new Error("Failed to fetch inventory stock");
      const data: InventoryStockRow[] = await res.json();
      setRows(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch inventory stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      (r.product?.product_name || "").toLowerCase().includes(term) ||
      (r.inventory_point?.inventory_point || "").toLowerCase().includes(term)
    );
  }, [rows, search]);

  return (
    <Card>
      <CardHeader
        title="Inventory Stock"
        action={
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search by product or inventory point..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <MagnifyingGlassIcon size={20} /> }}
            />
          </Stack>
        }
      />
      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <MyCircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Inventory Point</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r, idx) => {
                const qty = r.quantity ?? 0;
                const status = qty <= 0 ? "Empty" : qty < 5 ? "Low" : "OK";
                const color: "default" | "error" | "warning" | "success" =
                  status === "Empty" ? "error" : status === "Low" ? "warning" : "success";
                return (
                  <TableRow key={`${r.product_id}-${r.inventory_point_id}-${idx}`}>
                    <TableCell>{r.product?.product_name || `#${r.product_id}`}</TableCell>
                    <TableCell>{r.inventory_point?.inventory_point || `#${r.inventory_point_id}`}</TableCell>
                    <TableCell align="right">{qty}</TableCell>
                    <TableCell>
                      <Chip label={status} color={color as any} size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryStockMain;
