import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem, IconButton } from "@mui/material";
import { Plus, Trash } from "@phosphor-icons/react";

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const OrderForm = ({ open, onClose, onSuccess, initialData }: OrderFormProps) => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    order_number: "",
    supplier_id: "",
    order_date: "",
    delivery_date: "",
    status: "Pending",
    items: [] as { product_id: string | number; quantity: number; unit_price: number }[],
  });

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch("/api/inventory/supplier"),
          fetch("/api/inventory/product"),
        ]);
        if (sRes.ok) setSuppliers(await sRes.json());
        if (pRes.ok) setProducts(await pRes.json());
      } catch {}
    };
    loadRefs();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        order_number: initialData.order_number || "",
        supplier_id: initialData.supplier_id || "",
        order_date: initialData.order_date?.slice?.(0, 10) || "",
        delivery_date: initialData.delivery_date?.slice?.(0, 10) || "",
        status: initialData.status || "Pending",
        items: (initialData.items || []).map((it: any) => ({ product_id: it.product_id, quantity: it.quantity, unit_price: it.unit_price })),
      });
    } else {
      setFormData({ order_number: "", supplier_id: "", order_date: "", delivery_date: "", status: "Pending", items: [] });
    }
    setFormError(null);
  }, [initialData, open]);

  const totalAmount = useMemo(() => formData.items.reduce((acc, it) => acc + (Number(it.quantity) * Number(it.unit_price || 0)), 0), [formData.items]);

  const addItem = () => setFormData((d) => ({ ...d, items: [...d.items, { product_id: "", quantity: 1, unit_price: 0 }] }));
  const removeItem = (idx: number) => setFormData((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));

  const handleItemChange = (idx: number, key: string, value: any) => {
    setFormData((d) => ({ ...d, items: d.items.map((it, i) => (i === idx ? { ...it, [key]: value } : it)) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const isUpdate = !!initialData?.order_id;
      const url = isUpdate ? `/api/inventory/order/${initialData.order_id}` : "/api/inventory/order";
      const method = isUpdate ? "PATCH" : "POST";

      const payload: any = {
        ...formData,
        supplier_id: Number(formData.supplier_id),
        items: formData.items.map((it) => ({ product_id: Number(it.product_id), quantity: Number(it.quantity), unit_price: Number(it.unit_price) })),
      };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err?.message || err?.error || `Failed to${isUpdate ? " update" : " add"} order`);
        return;
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setFormError(error.message || "Unexpected error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth key={initialData?.order_id || "new"}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData?.order_id ? "Edit Order" : "Add Order"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Order Number" value={formData.order_number} onChange={(e) => setFormData({ ...formData, order_number: e.target.value })} fullWidth required />
            <TextField select label="Supplier" value={formData.supplier_id} onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })} fullWidth required>
              {suppliers.map((s) => (
                <MenuItem key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField type="date" label="Order Date" InputLabelProps={{ shrink: true }} value={formData.order_date} onChange={(e) => setFormData({ ...formData, order_date: e.target.value })} fullWidth />
              <TextField type="date" label="Delivery Date" InputLabelProps={{ shrink: true }} value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} fullWidth />
            </Stack>
            <TextField select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} fullWidth>
              {['Pending','Processing','Shipped','Delivered','Cancelled'].map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
            </TextField>

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <strong>Items</strong>
                <Button onClick={addItem} startIcon={<Plus size={16} />}>Add Item</Button>
              </Stack>
              {formData.items.map((it, idx) => (
                <Stack key={idx} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                  <TextField select label="Product" value={it.product_id} onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)} fullWidth>
                    {products.map((p) => (<MenuItem key={p.product_id} value={p.product_id}>{p.product_name}</MenuItem>))}
                  </TextField>
                  <TextField type="number" label="Qty" value={it.quantity} onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))} sx={{ width: 120 }} />
                  <TextField type="number" label="Unit Price" value={it.unit_price} onChange={(e) => handleItemChange(idx, 'unit_price', Number(e.target.value))} sx={{ width: 160 }} />
                  <TextField label="Total" value={Number(it.quantity) * Number(it.unit_price || 0)} InputProps={{ readOnly: true }} sx={{ width: 160 }} />
                  <IconButton color="error" onClick={() => removeItem(idx)}><Trash /></IconButton>
                </Stack>
              ))}
              <TextField label="Grand Total" value={totalAmount} InputProps={{ readOnly: true }} />
            </Stack>

            {formError && <div style={{ color: "red" }}>{formError}</div>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{initialData?.order_id ? "Update" : "Add"} Order</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrderForm;
