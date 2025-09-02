import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
} from "@mui/material";
import { MagnifyingGlassIcon, PlusIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import MyCircularProgress from "@/components/common/my-circular-progress";
import TransferForm from "./TransferForm";

// Simple debounce utility
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

interface TransferItem {
  product: { product_id: number; product_name: string } | null;
  product_id: number;
  quantity: number;
}

interface TransferRow {
  transfer_id: number;
  created_at: string;
  note?: string | null;
  from_point: { inventory_point_id: number; inventory_point: string };
  to_point: { inventory_point_id: number; inventory_point: string };
  items: TransferItem[];
}

const TransfersMain: React.FC = () => {
  const [rows, setRows] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);

  // Debounce search to improve performance
  const debouncedSetSearch = useCallback(
    debounce((value: string) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(search);
  }, [search, debouncedSetSearch]);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/transfer");
      if (!res.ok) throw new Error("Failed to fetch transfers");
      const data: TransferRow[] = await res.json();
      setRows(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const products = r.items.map((i) => i.product?.product_name || "").join(" ").toLowerCase();
      return (
        r.from_point.inventory_point.toLowerCase().includes(term) ||
        r.to_point.inventory_point.toLowerCase().includes(term) ||
        products.includes(term) ||
        (r.note || "").toLowerCase().includes(term)
      );
    });
  }, [rows, debouncedSearch]);

  return (
    <Card>
      <CardHeader
        title="Transfers"
        action={
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search transfers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <MagnifyingGlassIcon size={20} /> }}
            />
            <Button variant="contained" startIcon={<PlusIcon />} onClick={() => setOpenForm(true)}>
              New Transfer
            </Button>
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
                <TableCell>Date</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.transfer_id}>
                  <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span style={{ fontSize: 13 }}>{t.from_point.inventory_point}</span>
                      <ArrowRightIcon size={16} />
                      <span style={{ fontSize: 13 }}>{t.to_point.inventory_point}</span>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {t.items.map((i, idx) => (
                        <Chip 
                          key={`${i.product_id}-${idx}`} 
                          label={`${i.product?.product_name || "#"} × ${i.quantity}`} 
                          size="small" 
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>{t.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {openForm && (
          <TransferForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            onSuccess={() => {
              setOpenForm(false);
              fetchRows();
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TransfersMain;
