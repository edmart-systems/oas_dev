"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Plus, Eye, PencilSimple, Trash, MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

interface Transfer {
  id: number;
  transferNumber: string;
  product: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  transferDate: string;
  expectedDate: string;
  status: "Pending" | "In Transit" | "Completed" | "Cancelled";
  reason: string;
}

const TransfersPage = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([
    { id: 1, transferNumber: "TRF-2024-001", product: "Laptop Dell XPS", fromWarehouse: "Main Warehouse", toWarehouse: "Secondary Storage", quantity: 10, transferDate: "2024-01-15", expectedDate: "2024-01-17", status: "In Transit", reason: "Stock rebalancing" },
    { id: 2, transferNumber: "TRF-2024-002", product: "Office Chair", fromWarehouse: "Secondary Storage", toWarehouse: "Main Warehouse", quantity: 5, transferDate: "2024-01-14", expectedDate: "2024-01-16", status: "Completed", reason: "High demand" },
    { id: 3, transferNumber: "TRF-2024-003", product: "Wireless Mouse", fromWarehouse: "Main Warehouse", toWarehouse: "Cold Storage", quantity: 25, transferDate: "2024-01-13", expectedDate: "2024-01-15", status: "Pending", reason: "Seasonal storage" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    transferNumber: "",
    product: "",
    fromWarehouse: "",
    toWarehouse: "",
    quantity: 0,
    transferDate: "",
    expectedDate: "",
    status: "Pending" as "Pending" | "In Transit" | "Completed" | "Cancelled",
    reason: "",
  });

  const warehouses = ["Main Warehouse", "Secondary Storage", "Cold Storage"];

  const handleAdd = () => {
    setEditingTransfer(null);
    setFormData({
      transferNumber: `TRF-2024-${String(transfers.length + 1).padStart(3, '0')}`,
      product: "",
      fromWarehouse: "",
      toWarehouse: "",
      quantity: 0,
      transferDate: new Date().toISOString().split('T')[0],
      expectedDate: "",
      status: "Pending",
      reason: "",
    });
    setOpen(true);
  };

  const handleEdit = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setFormData(transfer);
    setOpen(true);
  };

  const handleSave = () => {
    if (editingTransfer) {
      setTransfers(transfers.map(t => t.id === editingTransfer.id ? { ...formData, id: editingTransfer.id } : t));
    } else {
      setTransfers([...transfers, { ...formData, id: Date.now() }]);
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setTransfers(transfers.filter(t => t.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "warning";
      case "In Transit": return "info";
      case "Completed": return "success";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="Stock Transfers"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search transfers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>
                New Transfer
              </Button>
            </Stack>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transfer Number</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Transfer Route</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Transfer Date</TableCell>
                  <TableCell>Expected Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{transfer.transferNumber}</TableCell>
                    <TableCell>{transfer.product}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span style={{ fontSize: '0.875rem' }}>{transfer.fromWarehouse}</span>
                        <ArrowRight size={16} />
                        <span style={{ fontSize: '0.875rem' }}>{transfer.toWarehouse}</span>
                      </Stack>
                    </TableCell>
                    <TableCell>{transfer.quantity}</TableCell>
                    <TableCell>{transfer.transferDate}</TableCell>
                    <TableCell>{transfer.expectedDate}</TableCell>
                    <TableCell>{transfer.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={transfer.status}
                        color={getStatusColor(transfer.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <Eye />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(transfer)}>
                        <PencilSimple />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(transfer.id)} color="error">
                        <Trash />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTransfer ? "Edit Transfer" : "New Transfer"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Transfer Number"
              value={formData.transferNumber}
              onChange={(e) => setFormData({ ...formData, transferNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Product"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>From Warehouse</InputLabel>
              <Select
                value={formData.fromWarehouse}
                onChange={(e) => setFormData({ ...formData, fromWarehouse: e.target.value })}
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse} value={warehouse}>{warehouse}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>To Warehouse</InputLabel>
              <Select
                value={formData.toWarehouse}
                onChange={(e) => setFormData({ ...formData, toWarehouse: e.target.value })}
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse} value={warehouse}>{warehouse}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Transfer Date"
              type="date"
              value={formData.transferDate}
              onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Expected Date"
              type="date"
              value={formData.expectedDate}
              onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Transit">In Transit</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default TransfersPage;