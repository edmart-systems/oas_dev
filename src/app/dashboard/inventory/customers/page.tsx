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

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: "Active" | "Inactive";
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: "ABC Corporation", email: "contact@abc.com", phone: "+1-555-0101", address: "123 Business Ave", totalOrders: 25, totalSpent: 45000, status: "Active" },
    { id: 2, name: "XYZ Ltd", email: "info@xyz.com", phone: "+1-555-0102", address: "456 Commerce St", totalOrders: 18, totalSpent: 32000, status: "Active" },
    { id: 3, name: "Tech Solutions Inc", email: "hello@techsol.com", phone: "+1-555-0103", address: "789 Tech Blvd", totalOrders: 5, totalSpent: 8500, status: "Inactive" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    totalOrders: 0,
    totalSpent: 0,
    status: "Active" as "Active" | "Inactive",
  });

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: "", email: "", phone: "", address: "", totalOrders: 0, totalSpent: 0, status: "Active" });
    setOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setOpen(true);
  };

  const handleSave = () => {
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...formData, id: editingCustomer.id } : c));
    } else {
      setCustomers([...customers, { ...formData, id: Date.now() }]);
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="Customers"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>
                Add Customer
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
                  <TableCell>Address</TableCell>
                  <TableCell>Total Orders</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Envelope size={14} />
                          <span style={{ fontSize: '0.875rem' }}>{customer.email}</span>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Phone size={14} />
                          <span style={{ fontSize: '0.875rem' }}>{customer.phone}</span>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status}
                        color={customer.status === "Active" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(customer)}>
                        <PencilSimple />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(customer.id)} color="error">
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
        <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Customer Name"
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
              label="Total Orders"
              type="number"
              value={formData.totalOrders}
              onChange={(e) => setFormData({ ...formData, totalOrders: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Total Spent"
              type="number"
              value={formData.totalSpent}
              onChange={(e) => setFormData({ ...formData, totalSpent: Number(e.target.value) })}
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

export default CustomersPage;