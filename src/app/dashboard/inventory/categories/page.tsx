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

interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  productCount: number;
  parentCategory: string | null;
  status: "Active" | "Inactive";
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Electronics", code: "ELEC", description: "Electronic devices and components", productCount: 125, parentCategory: null, status: "Active" },
    { id: 2, name: "Laptops", code: "LAPTOP", description: "Portable computers", productCount: 45, parentCategory: "Electronics", status: "Active" },
    { id: 3, name: "Furniture", code: "FURN", description: "Office and home furniture", productCount: 78, parentCategory: null, status: "Active" },
    { id: 4, name: "Stationery", code: "STAT", description: "Office supplies and stationery", productCount: 156, parentCategory: null, status: "Inactive" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    productCount: 0,
    parentCategory: "",
    status: "Active" as "Active" | "Inactive",
  });

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", code: "", description: "", productCount: 0, parentCategory: "", status: "Active" });
    setOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ ...category, parentCategory: category.parentCategory || "" });
    setOpen(true);
  };

  const handleSave = () => {
    const categoryData = {
      ...formData,
      parentCategory: formData.parentCategory || null,
    };
    
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...categoryData, id: editingCategory.id } : c));
    } else {
      setCategories([...categories, { ...categoryData, id: Date.now() }]);
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <PageTitle title="Category Management" />
      <InventoryHorizontalNav />
      
      <Card>
        <CardHeader
          title="Categories"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>
                Add Category
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
                  <TableCell>Description</TableCell>
                  <TableCell>Parent Category</TableCell>
                  <TableCell>Product Count</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.code}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category.parentCategory || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={category.productCount}
                        color={category.productCount > 100 ? "success" : category.productCount > 50 ? "info" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.status}
                        color={category.status === "Active" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(category)}>
                        <PencilSimple />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(category.id)} color="error">
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
        <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
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
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Parent Category (Optional)"
              value={formData.parentCategory}
              onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
              fullWidth
            />
            <TextField
              label="Product Count"
              type="number"
              value={formData.productCount}
              onChange={(e) => setFormData({ ...formData, productCount: Number(e.target.value) })}
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

export default CategoriesPage;