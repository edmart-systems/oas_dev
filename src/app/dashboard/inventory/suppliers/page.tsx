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
} from "@mui/material";
import { Plus, PencilSimple, Trash, MagnifyingGlass, Phone, Envelope } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  totalOrders: number;
  totalPurchased: number;
  rating: number;
  status: "Active" | "Inactive";
}

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 1, name: "Tech Supplies Ltd", email: "sales@techsupplies.com", phone: "+1-555-0201", address: "100 Tech Park", category: "Electronics", totalOrders: 45, totalPurchased: 125000, rating: 4.5, status: "Active" },
    { id: 2, name: "Office Furniture Co", email: "orders@officefurn.com", phone: "+1-555-0202", address: "200 Furniture Ave", category: "Furniture", totalOrders: 28, totalPurchased: 85000, rating: 4.2, status: "Active" },
    { id: 3, name: "Stationery World", email: "info@statworld.com", phone: "+1-555-0203", address: "300 Paper St", category: "Stationery", totalOrders: 12, totalPurchased: 15000, rating: 3.8, status: "Inactive" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    totalOrders: 0,
    totalPurchased: 0,
    rating: 0,
    status: "Active" as "Active" | "Inactive",
  });

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormData({ name: "", email: "", phone: "", address: "", category: "", totalOrders: 0, totalPurchased: 0, rating: 0, status: "Active" });
    setOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setOpen(true);
  };

  const handleSave = () => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...formData, id: editingSupplier.id } : s));
    } else {
      setSuppliers([...suppliers, { ...formData, id: Date.now() }]);
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "success";
    if (rating >= 4.0) return "info";
    if (rating >= 3.5) return "warning";
    return "error";
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <PageTitle title="Supplier Management" />
      <InventoryHorizontalNav />
      
      <Card>
        <CardHeader
          title="Suppliers"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>
                Add Supplier
              </Button>
            </Stack>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Total Orders</TableCell>
                  <TableCell>Total Purchased</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Envelope size={14} />
                          <span style={{ fontSize: '0.875rem' }}>{supplier.email}</span>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Phone size={14} />
                          <span style={{ fontSize: '0.875rem' }}>{supplier.phone}</span>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>{supplier.category}</TableCell>
                    <TableCell>{supplier.totalOrders}</TableCell>
                    <TableCell>${supplier.totalPurchased.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${supplier.rating}/5`}
                        color={getRatingColor(supplier.rating) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={supplier.status}
                        color={supplier.status === "Active" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(supplier)}>
                        <PencilSimple />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(supplier.id)} color="error">
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
        <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Supplier Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
            />
            <TextField
              label="Rating (1-5)"
              type="number"
              inputProps={{ min: 1, max: 5, step: 0.1 }}
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              fullWidth
            />
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

export default SuppliersPage;