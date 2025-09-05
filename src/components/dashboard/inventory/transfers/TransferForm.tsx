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
interface LocationOption { location_id: number; location_name: string }
interface UserOption { userId: number; firstName: string; lastName: string }

const TransferForm: React.FC<TransferFormProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [stockData, setStockData] = useState<{[key: string]: number}>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  const [fromLocation, setFromLocation] = useState<number | "">("");
  const [toLocation, setToLocation] = useState<number | "">("");
  const [assignedUser, setAssignedUser] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<{ product_id: number | ""; quantity: number | "" }[]>([
    { product_id: "", quantity: "" },
  ]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const loadOptions = useCallback(async () => {
    try {
      const [prodRes, locationRes, userRes] = await Promise.all([
        fetch("/api/inventory/product"),
        fetch("/api/inventory/location"),
        fetch("/api/user?role=2"),
      ]);
      const prodData = await prodRes.json();
      const locationData = await locationRes.json();
      const userData = await userRes.json();
      
      setProducts(prodData || []);
      setLocations(locationData || []);
      setUsers(userData || []);
      
      // Fetch location stock data
      const stockRes = await fetch("/api/inventory/inventory_stock");
      const stockDataRes = await stockRes.json();
      
      // Create stock lookup: "productId_locationId" -> quantity
      const stockLookup: {[key: string]: number} = {};
      (stockDataRes || []).forEach((location: any) => {
        location.stock?.forEach((stock: any) => {
          const key = `${stock.product_id}_${location.location_id}`;
          stockLookup[key] = stock.quantity || 0;
        });
      });
      setStockData(stockLookup);
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
    setErrors({});
    const newErrors: {[key: string]: string} = {};

    // basic validation
    if (!fromLocation || !toLocation || !assignedUser) {
      if (!fromLocation) newErrors.fromLocation = "Please select from location";
      if (!toLocation) newErrors.toLocation = "Please select to location";
      if (!assignedUser) newErrors.assignedUser = "Please assign a user";
    } else if (fromLocation === toLocation) {
      newErrors.toLocation = "From and To locations must be different";
    }

    const validItems = items
      .filter((it) => it.product_id && it.quantity && Number(it.quantity) > 0)
      .map((it) => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) }));
    
    if (validItems.length === 0) {
      newErrors.items = "Add at least one valid item";
    }

    // Stock validation
    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      const stockKey = `${item.product_id}_${fromLocation}`;
      const available = stockData[stockKey] || 0;
      if (available < item.quantity) {
        const product = products.find(p => p.product_id === item.product_id);
        newErrors[`item_${i}`] = `Insufficient stock for ${product?.product_name || 'product'}. Available: ${available}, Required: ${item.quantity}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_location_id: Number(fromLocation),
          to_location_id: Number(toLocation),
          assigned_user_id: Number(assignedUser),
          note: note || undefined,
          items: validItems,
        }),
      });
      if (!res.ok) {
        try {
          const data = await res.json();
          if (data?.details && typeof data.details === 'object') {
            // Handle Zod validation errors
            const errors = [];
            for (const [field, messages] of Object.entries(data.details)) {
              if (Array.isArray(messages)) {
                errors.push(...messages);
              }
            }
            if (errors.length > 0) {
              toast.error(errors.join('. '));
              return;
            }
          }
          const errorMessage = data?.message || data?.error || "Failed to create transfer";
          throw new Error(errorMessage);
        } catch (parseError) {
          throw new Error("Failed to create transfer");
        }
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
            <FormControl fullWidth error={!!errors.fromLocation}>
              <InputLabel>From Location</InputLabel>
              <Select
                label="From Location"
                value={fromLocation}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!isNaN(value)) setFromLocation(value);
                }}
              >
                {locations.map((l) => (
                  <MenuItem key={l.location_id} value={l.location_id}>
                    {l.location_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.fromLocation && <div style={{color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px'}}>{errors.fromLocation}</div>}
            </FormControl>
            <FormControl fullWidth error={!!errors.toLocation}>
              <InputLabel>To Location</InputLabel>
              <Select
                label="To Location"
                value={toLocation}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!isNaN(value)) setToLocation(value);
                }}
              >
                {locations.map((l) => (
                  <MenuItem key={l.location_id} value={l.location_id}>
                    {l.location_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.toLocation && <div style={{color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px'}}>{errors.toLocation}</div>}
            </FormControl>
          </Stack>

          <FormControl fullWidth error={!!errors.assignedUser}>
            <InputLabel>Assign to User</InputLabel>
            <Select
              label="Assign to User"
              value={assignedUser}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!isNaN(value)) setAssignedUser(value);
              }}
            >
              {users.map((u) => (
                <MenuItem key={u.userId} value={u.userId}>
                  {u.firstName} {u.lastName}
                </MenuItem>
              ))}
            </Select>
            {errors.assignedUser && <div style={{color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px'}}>{errors.assignedUser}</div>}
          </FormControl>

          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
          />

          <Stack spacing={1}>
            {errors.items && <div style={{color: '#d32f2f', fontSize: '0.875rem'}}>{errors.items}</div>}
            {items.map((it, idx) => (
              <Stack key={idx} spacing={1}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
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
                {errors[`item_${idx}`] && <div style={{color: '#d32f2f', fontSize: '0.75rem'}}>{errors[`item_${idx}`]}</div>}
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
