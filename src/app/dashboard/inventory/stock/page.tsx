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
import { Plus, PencilSimple, Warning, MagnifyingGlass } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

interface StockItem {
  id: number;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastUpdated: string;
}

const StockPage = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: 1, productName: "Laptop Dell XPS", sku: "DELL001", currentStock: 25, minStock: 10, maxStock: 100, location: "A1-01", lastUpdated: "2024-01-15" },
    { id: 2, productName: "Office Chair", sku: "CHAIR001", currentStock: 5, minStock: 15, maxStock: 50, location: "B2-03", lastUpdated: "2024-01-14" },
    { id: 3, productName: "Wireless Mouse", sku: "MOUSE001", currentStock: 0, minStock: 20, maxStock: 200, location: "A3-05", lastUpdated: "2024-01-13" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    productName: "",
    sku: "",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    location: "",
  });

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData(item);
    setOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setStockItems(stockItems.map(item => 
        item.id === editingItem.id 
          ? { ...formData, id: editingItem.id, lastUpdated: new Date().toISOString().split('T')[0] }
          : item
      ));
    }
    setOpen(false);
  };

  const getStockStatus = (current: number, min: number, max: number) => {
    if (current === 0) return { label: "Out of Stock", color: "error" as const };
    if (current < min) return { label: "Low Stock", color: "warning" as const };
    if (current > max) return { label: "Overstock", color: "info" as const };
    return { label: "Normal", color: "success" as const };
  };

  const filteredItems = stockItems.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      
      <Card>
        <CardHeader
          title="Stock Levels"
          action={
            <TextField
              size="small"
              placeholder="Search stock..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <MagnifyingGlass size={20} />,
              }}
            />
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Min/Max</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(item.currentStock, item.minStock, item.maxStock);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {item.currentStock < item.minStock && <Warning size={16} color="#ed6c02" />}
                          {item.currentStock}
                        </Stack>
                      </TableCell>
                      <TableCell>{item.minStock} / {item.maxStock}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} size="small" />
                      </TableCell>
                      <TableCell>{item.lastUpdated}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(item)}>
                          <PencilSimple />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Product Name"
              value={formData.productName}
              disabled
              fullWidth
            />
            <TextField
              label="SKU"
              value={formData.sku}
              disabled
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
              label="Minimum Stock"
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Maximum Stock"
              type="number"
              value={formData.maxStock}
              onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default StockPage;