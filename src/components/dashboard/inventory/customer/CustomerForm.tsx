import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem } from "@mui/material";

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const CustomerForm = ({ open, onClose, onSuccess, initialData }: CustomerFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "Active",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        status: initialData.status || "Active",
      });
    } else {
      setFormData({ name: "", email: "", phone: "", address: "", status: "Active" });
    }
    setFormError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const isUpdate = !!initialData?.customer_id;
      const url = isUpdate ? `/api/inventory/customer/${initialData.customer_id}` : "/api/inventory/customer";
      const method = isUpdate ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err?.message || err?.error || `Failed to${isUpdate ? " update" : " add"} customer`);
        return;
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setFormError(error.message || "Unexpected error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth key={initialData?.customer_id || "new"}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData?.customer_id ? "Edit Customer" : "Add Customer"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Customer Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth required />
            <TextField label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth error={!!formError} helperText={formError} />
            <TextField label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
            <TextField label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} fullWidth multiline rows={2} />
            <TextField select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} fullWidth>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{initialData?.customer_id ? "Update" : "Add"} Customer</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerForm;
