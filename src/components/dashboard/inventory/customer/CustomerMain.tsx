"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { PlusIcon } from "lucide-react";
import { toast } from "react-toastify";
import CustomerForm from "./CustomerForm";
import CustomerTable from "./CustomerTable";
import MyCircularProgress from "@/components/common/my-circular-progress";
import type { Customer } from "@/modules/inventory/types/customer.types";

const CustomerMain = () => {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Customer | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/customer");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data: Customer[] = await res.json();
      setRows(data);
    } catch (err) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filtered = rows.filter((r) =>
    [r.name, r.email, r.phone].some((v: any) => (v || "").toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (row: any) => { setSelected(row); setOpenForm(true); };
  const handleAdd = () => { setSelected(null); setOpenForm(true); };
  const handleDeleteClick = (row: any) => { setToDelete(row); setDeleteOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/inventory/customer/${toDelete.customer_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete customer");
      toast.success("Customer deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete customer");
    } finally {
      setDeleteOpen(false);
      setToDelete(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="Customers"
          action={
            <Stack direction="row" spacing={2}>
              <TextField size="small" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <MagnifyingGlass size={20} /> }} />
              <Button variant="contained" disabled={loading} startIcon={<PlusIcon />} onClick={handleAdd}>
                Add Customer
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
            <CustomerTable data={filtered} onEdit={handleEdit} onDelete={handleDeleteClick} />
          )}
        </CardContent>
        <CustomerForm open={openForm} initialData={selected} onClose={() => setOpenForm(false)} onSuccess={() => { fetchData(); setOpenForm(false); }} />
      </Card>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{toDelete?.name}"? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CustomerMain;
