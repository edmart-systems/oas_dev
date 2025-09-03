"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Box,
  alpha,
  useTheme,
} from "@mui/material";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import ProductForm from "./productForm";
import ProductTable from "./productTable";
import { Product } from "@/types/product.types";
import MyCircularProgress from "@/components/common/my-circular-progress";

const ProductsMain = () => {
  const theme = useTheme();

  // Uniform colors (same structure as ProductTable)
  const colors = {
    primary: "#D98219",
    error: theme.palette.error.main,
    surface: theme.palette.background.paper,
    surfaceVariant:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.grey[800], 0.7)
        : "#ffffff",
    border: theme.palette.divider,
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/product`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setProducts(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingProduct(null);
    setOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      const checkRes = await fetch(
        `/api/inventory/product/${productToDelete.product_id}/check-references`
      );
      if (checkRes.ok) {
        const { hasReferences, references } = await checkRes.json();
        if (hasReferences) {
          toast.error(
            `Cannot delete product. It's referenced in: ${references.join(", ")}`
          );
          setDeleteOpen(false);
          return;
        }
      }

      const res = await fetch(
        `/api/inventory/product/${productToDelete.product_id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Product deleted");
      fetchData();
    } catch (error: any) {
      if (error.message.includes("foreign key constraint")) {
        toast.error(
          "Cannot delete product. It's being used in purchase orders or other records."
        );
      } else {
        toast.error(error.message || "Delete failed");
      }
    } finally {
      setDeleteOpen(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_barcode.toString().includes(searchTerm)
  );

  return (
    <Stack
      spacing={3}
      
    >
      <Card
        sx={{
          borderRadius: 3,
          backgroundColor: colors.surface,
          boxShadow: `0 4px 16px ${alpha(colors.primary, 0.08)}`,
        }}
      >
        <CardHeader
          title="Products"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button
                variant="contained"
                disabled={loading}
                startIcon={<Plus />}
                onClick={handleAdd}
                sx={{
                  backgroundColor: colors.primary,
                  "&:hover": {
                    backgroundColor: alpha(colors.primary, 0.9),
                  },
                }}
              >
                Add Product
              </Button>
            </Stack>
          }
          sx={{
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceVariant,
          }}
        />
        <CardContent>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height={200}
            >
              <MyCircularProgress />
            </Box>
          ) : (
            <ProductTable
              Products={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Product Form */}
      <ProductForm
        open={open}
        onSubmit={() => {
          fetchData();
          setOpen(false);
          toast.success("Product saved successfully");
        }}
        onCancel={() => setOpen(false)}
        initialData={editingProduct}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete &quot;{productToDelete?.product_name}
          &quot;? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ProductsMain;
