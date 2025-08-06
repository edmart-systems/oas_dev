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
import { Plus, Eye, PencilSimple, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  items: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  type: "Sale" | "Purchase";
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([
    { id: 1, orderNumber: "ORD-2024-001", customer: "ABC Corporation", orderDate: "2024-01-15", deliveryDate: "2024-01-25", totalAmount: 15000, items: 5, status: "Processing", type: "Sale" },
    { id: 2, orderNumber: "ORD-2024-002", customer: "XYZ Ltd", orderDate: "2024-01-14", deliveryDate: "2024-01-28", totalAmount: 8500, items: 3, status: "Shipped", type: "Sale" },
    { id: 3, orderNumber: "PO-2024-001", customer: "Tech Supplies Ltd", orderDate: "2024-01-13", deliveryDate: "2024-01-20", totalAmount: 25000, items: 8, status: "Delivered", type: "Purchase" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    orderNumber: "",
    customer: "",
    orderDate: "",
    deliveryDate: "",
    totalAmount: 0,
    items: 0,
    status: "Pending" as "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled",
    type: "Sale" as "Sale" | "Purchase",
  });

  const handleAdd = () => {
    setEditingOrder(null);
    setFormData({
      orderNumber: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
      customer: "",
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: "",
      totalAmount: 0,
      items: 0,
      status: "Pending",
      type: "Sale",
    });
    setOpen(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData(order);
    setOpen(true);
  };

  const handleSave = () => {
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? { ...formData, id: editingOrder.id } : o));
    } else {
      setOrders([...orders, { ...formData, id: Date.now() }]);
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "warning";
      case "Processing": return "info";
      case "Shipped": return "primary";
      case "Delivered": return "success";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "Sale" ? "success" : "info";
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <PageTitle title="Orders Management" />
      <InventoryHorizontalNav />
      
      <Card>
        <CardHeader
          title="Orders"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>
                New Order
              </Button>
            </Stack>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Customer/Supplier</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{order.deliveryDate}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.type}
                        color={getTypeColor(order.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <Eye />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(order)}>
                        <PencilSimple />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(order.id)} color="error">
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
        <DialogTitle>{editingOrder ? "Edit Order" : "New Order"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Order Number"
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Customer/Supplier"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              fullWidth
            />
            <TextField
              label="Order Date"
              type="date"
              value={formData.orderDate}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Delivery Date"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Number of Items"
              type="number"
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Total Amount"
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <MenuItem value="Sale">Sale</MenuItem>
                <MenuItem value="Purchase">Purchase</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
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

export default OrdersPage;