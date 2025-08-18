"use client";

import { useEffect, useState } from "react";
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
  CircularProgress,
  Box,
} from "@mui/material";
import { Plus, PencilSimple, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";
import { toast } from "react-toastify";
import { Product } from '@/modules/inventory/types/purchase.types'
import ProductForm from "./productForm";
import ProductTable from "./productTable";
import { CreateProductInput } from "@/modules/inventory/dtos/product.dto";
import MyCircularProgress from "@/components/common/my-circular-progress";



const ProductsMain = () => {
    
    const [product, setproduct] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setproduct(data);
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
    // Check if product is referenced in other tables
    const checkRes = await fetch(`/api/inventory/product/${productToDelete.product_id}/check-references`);
    if (checkRes.ok) {
      const { hasReferences, references } = await checkRes.json();
      if (hasReferences) {
        toast.error(`Cannot delete product. It's referenced in: ${references.join(', ')}`);
        setDeleteOpen(false);
        return;
      }
    }
    
    const res = await fetch(`/api/inventory/product/${productToDelete.product_id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    toast.success("Product deleted");
    fetchData()
  } catch (error: any) {
    if (error.message.includes('foreign key constraint')) {
      toast.error("Cannot delete product. It's being used in purchase orders or other records.");
    } else {
      toast.error(error.message || "Delete failed");
    }
  } finally {
    setDeleteOpen(false);
    setProductToDelete(null);
  }
};


  const filteredproduct = product.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_barcode.toString().includes(searchTerm)
  );
  
  return (
    <Stack spacing={3}>
      <Card>
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
              <Button variant="contained" disabled={loading} startIcon={<Plus />} onClick={handleAdd}>
                Add Product
              </Button>
            </Stack>
          }
        />
        <CardContent>
          { loading ? ( 
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <MyCircularProgress />
            </Box>):(
               <ProductTable
            Products={filteredproduct}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
            )}
         
        
        </CardContent>
      </Card>

          {/* {Add products} */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
            <DialogContent>
              <ProductForm 
                open={open}
                onSubmit={()=>{
                  fetchData()
                  setOpen(false);
                  toast.success("Product added successfully")
                }} 
                onCancel={() => setOpen(false)} 
                initialData={editingProduct}
              />
            </DialogContent>
          </Dialog>

          {/* {Delete Product Confirmation} */}
          <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              Are you sure you want to delete &quot;{productToDelete?.product_name}&quot;? This action cannot be undone.
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