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
} from "@mui/material";
import { Plus, PencilSimple, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";
import { toast } from "react-toastify";
import { Product } from '@/modules/inventory/types/purchase.types'
import ProductForm from "./productForm";
import ProductTable from "./productTable";
import { CreateProductInput } from "@/modules/inventory/dtos/product.dto";



const ProductsMain = () => {
    
    const [product, setproduct] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<CreateProductInput>({
    product_name: "",
    product_barcode: 0,
    product_description: "",
    unit_id: 1,
    category_id: 1,
    tag_id: 1,
    buying_price: 0,
    selling_price: 0,
    currency_id: 1,
  });

  const fetchproduct = async () => {
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
      fetchproduct();
    }, []);
  
    const handleAdd = () => {
      setEditingProduct(null);
      setFormData({
        product_name: "",
        product_barcode: 0,
        product_description: "",
        unit_id: 1,
        category_id: 1,
        tag_id: 1,
        buying_price: 0,
        selling_price: 0,
        currency_id: 1,
      });
      setOpen(true);
    };

 const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      product_barcode: product.product_barcode,
      product_description: product.product_description,
      unit_id: product.unit_id,
      category_id: product.category_id,
      tag_id: product.tag_id,
      buying_price: product.buying_price,
      selling_price: product.selling_price,
      currency_id: product.currency_id,
    });
    setOpen(true);
  };
    const handleSave = async (formData: any) => {
      setSaving(true);
      try {
        console.log('Submitting data:', formData);
        console.log('URL:', editingProduct ? `/api/inventory/product/${editingProduct.product_id}` : `/api/inventory/product`);
        console.log('Method:', editingProduct ? 'PATCH' : 'POST');
        
        const res = await fetch(
          editingProduct ? `/api/inventory/product/${editingProduct.product_id}` : `/api/inventory/product`,
          {
            method: editingProduct ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          }
        );
        
        console.log('Response status:', res.status);
        console.log('Response headers:', res.headers);
        
        let data = null;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.log('Response text:', text);
          if (text) {
            try {
              data = JSON.parse(text);
            } catch {
              data = { message: text };
            }
          }
        }
        
        console.log('Parsed data:', data);
        
        if (!res.ok) {
          const errorMsg = data?.error || data?.message || `HTTP ${res.status}: Save failed`;
          console.error('Save failed:', errorMsg);
          throw new Error(errorMsg);
        }
        
        toast.success(editingProduct ? "Product updated" : "Product created");
        fetchproduct();
        setOpen(false);
      } catch (error: any) {
        console.error('Save error:', error);
        toast.error(error.message || "Save failed");
      } finally {
        setSaving(false);
      }
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
    fetchproduct();
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
              <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>
                Add Product
              </Button>
            </Stack>
          }
        />
        <CardContent>
          <ProductTable
            Products={filteredproduct}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        
        </CardContent>
      </Card>

          {/* {Add products} */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
            <DialogContent>
              <ProductForm 
                onSubmit={handleSave} 
                onCancel={() => setOpen(false)} 
                initialData={editingProduct}
              />
            </DialogContent>
          </Dialog>

          {/* {Delete Product Confirmation} */}
          <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              Are you sure you want to delete "{productToDelete?.product_name}"? This action cannot be undone.
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