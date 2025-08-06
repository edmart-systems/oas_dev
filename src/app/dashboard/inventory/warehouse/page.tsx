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
import { Plus, PencilSimple, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  capacity: number;
  currentStock: number;
  manager: string;
  status: "Active" | "Inactive";
}

const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    { id: 1, name: "Main Warehouse", code: "WH001", address: "123 Industrial Ave", capacity: 10000, currentStock: 7500, manager: "John Smith", status: "Active" },
    { id: 2, name: "Secondary Storage", code: "WH002", address: "456 Storage St", capacity: 5000, currentStock: 3200, manager: "Jane Doe", status: "Active" },
    { id: 3, name: "Cold Storage", code: "WH003", address: "789 Cold Ave", capacity: 2000, currentStock: 1800, manager: "Bob Wilson", status: "Inactive" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    capacity: 0,
    currentStock: 0,
    manager: "",
    status: "Active" as "Active" | "Inactive",
  });

  const handleAdd = () => {
    setEditingWarehouse(null);
    setFormData({ name: "", code: "", address: "", capacity: 0, currentStock: 0, manager: "", status: "Active" });
    setOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData(warehouse);
    setOpen(true);
  };

  const handleSave = () => {
    if (editingWarehouse) {
      setWarehouses(warehouses.map(w => w.id === editingWarehouse.id ? { ...formData, id: editingWarehouse.id } : w));
    } else {
      setWarehouses([...warehouses, { ...formData, id: Date.now() }]);
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setWarehouses(warehouses.filter(w => w.id !== id));
  };

  const getUtilization = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <PageTitle title="Warehouse Management" />
      <InventoryHorizontalNav />
      
      <Card>
        <CardHeader
          title="Warehouses"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>
                Add Warehouse
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
                  <TableCell>Code</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Utilization</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWarehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>{warehouse.name}</TableCell>
                    <TableCell>{warehouse.code}</TableCell>
                    <TableCell>{warehouse.address}</TableCell>
                    <TableCell>{warehouse.capacity.toLocaleString()}</TableCell>
                    <TableCell>{warehouse.currentStock.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${getUtilization(warehouse.currentStock, warehouse.capacity)}%`}
                        color={getUtilization(warehouse.currentStock, warehouse.capacity) > 80 ? "error" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{warehouse.manager}</TableCell>
                    <TableCell>
                      <Chip
                        label={warehouse.status}
                        color={warehouse.status === "Active" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(warehouse)}>
                        <PencilSimple />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(warehouse.id)} color="error">
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
        <DialogTitle>{editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Warehouse Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Current Stock"
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Manager"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
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

export default WarehousePage;