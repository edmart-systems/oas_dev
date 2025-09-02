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

// Configuration constants
const LOW_STOCK_THRESHOLD = 5;

// Move color mapping outside component to avoid recreation on every render
const getChipColor = (status: string): "default" | "error" | "warning" | "success" => {
  switch (status) {
    case "Empty": return "error";
    case "Low": return "warning";
    default: return "success";
  }
};

interface ProductStockDto {
  product_id: number;
  product_name: string;
  barcode: number;
  supplier?: string;
  category: string;
  tag: string;
  unit: string;
  quantity: number;
}

interface InventoryStockDto {
  inventory_point_id: number;
  inventory_point: string;
  stock: ProductStockDto[];
}

// flattened row for the table
interface InventoryStockRow {
  product_id: number;
  product_name: string;
  inventory_point_id: number;
  inventory_point: string;
  quantity: number;
}

const InventoryStockMain: React.FC = () => {
  const [rows, setRows] = useState<InventoryStockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/inventory_stock"); 
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to fetch inventory stock'}`);
      }

      const data: InventoryStockDto[] = await res.json();

      // flatten nested structure into table rows
      const flatRows: InventoryStockRow[] = data.flatMap((inv) =>
        inv.stock.map((s) => ({
          product_id: s.product_id,
          product_name: s.product_name,
          inventory_point_id: inv.inventory_point_id,
          inventory_point: inv.inventory_point ? inv.inventory_point : '',
          quantity: s.quantity ? s.quantity : 0,
        }))
      );

      setRows(flatRows);
    } catch (e: any) {
      console.error('Inventory stock fetch error:', e);
      toast.error(e.message || "Failed to fetch inventory stock");
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
    return rows.filter(
      (r) =>
        r.product_name.toLowerCase().includes(term) ||
        r.inventory_point.toLowerCase().includes(term)
    );
  }, [rows, search]);
  const getStatus = (qty: number) => {
  if (qty <= 0) return "Empty";
  if (qty < LOW_STOCK_THRESHOLD) return "Low";
  return "OK";
};

const getTableRowKey = (r: any, idx: number) => {
  return `${r.product_id}-${r.inventory_point_id}-${idx}`;
};

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
              InputProps={{
                startAdornment: <MagnifyingGlassIcon size={20} />,
              }}
            />
          </Stack>
        }
      />
      <CardContent>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
          >
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
                      {filtered.map((r, idx) => (
              <TableRow key={getTableRowKey(r, idx)}>
                <TableCell>{r.product_name}</TableCell>
                <TableCell>{r.inventory_point}</TableCell>
                <TableCell align="right">{r.quantity ?? 0}</TableCell>
                <TableCell>
                  <Chip label={getStatus(r.quantity)} color={getChipColor(getStatus(r.quantity))} size="small" />
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryStockMain;
