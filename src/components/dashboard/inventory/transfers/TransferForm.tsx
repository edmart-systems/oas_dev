import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import MyCircularProgress from "@/components/common/my-circular-progress";

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductOption { product_id: number; product_name: string }
interface InventoryPointOption { inventory_point_id: number; inventory_point: string }

const TransferForm: React.FC<TransferFormProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [points, setPoints] = useState<InventoryPointOption[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [fromPoint, setFromPoint] = useState<number | "">("");
  const [toPoint, setToPoint] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<{ product_id: number | ""; quantity: number | "" }[]>([
    { product_id: "", quantity: "" },
  ]);

  const loadOptions = useCallback(async () => {
    try {
      const [prodRes, pointRes] = await Promise.all([
        fetch("/api/inventory/product"),
        fetch("/api/inventory/inventory_point"),
      ]);
      const prodData = await prodRes.json();
      const pointData = await pointRes.json();
      setProducts(prodData || []);
      setPoints(pointData || []);
      setDataLoaded(true);
    } catch (e) {
      toast.error("Failed to load options");
    }
  }, []);

  useEffect(() => {
    if (open && !dataLoaded) {
      loadOptions();
    }
  }, [open, dataLoaded, loadOptions]);

  const addItem = () => setItems((prev) => [...prev, { product_id: "", quantity: "" }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: "product_id" | "quantity", value: any) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));

  const handleSubmit = async () => {
    // basic validation
    if (!fromPoint || !toPoint || fromPoint === toPoint) {
      toast.error("Select different From and To inventory points");
      return;
    }
    const validItems = items
      .filter((it) => it.product_id && it.quantity && Number(it.quantity) > 0)
      .map((it) => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) }));
    if (validItems.length === 0) {
      toast.error("Add at least one valid item");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_inventory_point_id: Number(fromPoint),
          to_inventory_point_id: Number(toPoint),
          note: note || undefined,
          items: validItems,
        }),
      });
      if (!res.ok) {
        let errorMessage = "Failed to create transfer";
        try {
          const data = await res.json();
          errorMessage = data?.message || data?.error || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text response
          try {
            const text = await res.text();
            errorMessage = text || errorMessage;
          } catch {
            // Use default error message if both JSON and text parsing fail
          }
        }
        throw new Error(errorMessage);
      }
      toast.success("Transfer created");
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to create transfer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Transfer</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>From Inventory Point</InputLabel>
              <Select
                label="From Inventory Point"
                value={fromPoint}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!isNaN(value)) setFromPoint(value);
                }}
              >
                {points.map((p) => (
                  <MenuItem key={p.inventory_point_id} value={p.inventory_point_id}>
                    {p.inventory_point}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>To Inventory Point</InputLabel>
              <Select
                label="To Inventory Point"
                value={toPoint}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!isNaN(value)) setToPoint(value);
                }}
              >
                {points.map((p) => (
                  <MenuItem key={p.inventory_point_id} value={p.inventory_point_id}>
                    {p.inventory_point}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
          />

          <Stack spacing={1}>
            {items.map((it, idx) => (
              <Stack key={idx} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                <FormControl fullWidth>
                  <InputLabel>Product</InputLabel>
                  <Select
                    label="Product"
                    value={it.product_id}
                    onChange={(e) => updateItem(idx, "product_id", e.target.value)}
                  >
                    {products.map((p) => (
                      <MenuItem key={p.product_id} value={p.product_id}>
                        {p.product_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  type="number"
                  label="Quantity"
                  value={it.quantity}
                  onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                  fullWidth
                />
                <IconButton color="error" onClick={() => removeItem(idx)}>
                  <TrashIcon />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<PlusIcon />} onClick={addItem} variant="outlined" size="small">
              Add Item
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <MyCircularProgress /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferForm;
