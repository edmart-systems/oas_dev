"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { PlusIcon } from "lucide-react";
import { toast } from "react-toastify";
import OrderForm from "./OrderForm";
import OrderTable from "./OrderTable";
import MyCircularProgress from "@/components/common/my-circular-progress";

type OrderRow = {
  order_id: number;
  order_number: string;
  supplier_id: number;
  status: string;
  items_count: number;
  total_amount: number;
  supplier?: { supplier_name: string } | null;
};

const OrderMain = () => {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<OrderRow | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/order");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data: OrderRow[] = await res.json();
      setRows(data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filtered = rows.filter((r) =>
    [r.order_number, r.status, r.supplier?.supplier_name].some((v: any) => (v || "").toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (row: any) => { setSelected(row); setOpenForm(true); };
  const handleAdd = () => { setSelected(null); setOpenForm(true); };
  const handleDeleteClick = (row: any) => { setToDelete(row); setDeleteOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/inventory/order/${toDelete.order_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete order");
      toast.success("Order deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete order");
    } finally {
      setDeleteOpen(false);
      setToDelete(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="Orders"
          action={
            <Stack direction="row" spacing={2}>
              <TextField size="small" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <MagnifyingGlass size={20} /> }} />
              <Button variant="contained" disabled={loading} startIcon={<PlusIcon />} onClick={handleAdd}>
                Add Order
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
            <OrderTable data={filtered} onEdit={handleEdit} onDelete={handleDeleteClick} />
          )}
        </CardContent>
        <OrderForm open={openForm} initialData={selected} onClose={() => setOpenForm(false)} onSuccess={() => { fetchData(); setOpenForm(false); }} />
      </Card>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete &quot;{toDelete?.order_number}&quot;? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OrderMain;
