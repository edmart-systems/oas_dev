'use client';

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  alpha,
  useTheme,
} from "@mui/material";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react";
import SupplierForm from "./SupplierForm";
import { toast } from "react-toastify";
import { Supplier } from "@/modules/inventory/types/supplier.types";
import SupplierTable from "./supplierTable";
import MyCircularProgress from "@/components/common/my-circular-progress";

const SupplierMain = () => {
  const theme = useTheme();

  const colors = {
    primary: "#D98219",
    secondary: theme.palette.info.main,
    error: theme.palette.error.main,
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : "#ffffff",
    border: theme.palette.divider,
  };

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/supplier');
      if (!res.ok) throw new Error("Failed to fetch Suppliers");
      const data: Supplier[] = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplier_tinNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setOpenForm(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;
    
    try {
      const res = await fetch(`/api/inventory/supplier/${supplierToDelete.supplier_id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete supplier');
      
      fetchData();
      toast.success('Supplier deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete supplier');
    } finally {
      setDeleteOpen(false);
      setSupplierToDelete(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 3,
          backgroundColor: colors.surface,
          boxShadow: `0 4px 16px ${alpha(colors.primary, 0.08)}`,
        }}
      >
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
                Add Supplier
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
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <MyCircularProgress />
            </Box>
          ) : (
            <SupplierTable suppliers={filteredSuppliers} onEdit={handleEdit} onDelete={handleDeleteClick} />
          )}
        </CardContent>
      </Card>

      <SupplierForm
        open={openForm}
        initialData={selectedSupplier}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          fetchData();
          setOpenForm(false);
          toast.success(selectedSupplier ? "Supplier updated successfully" : "Supplier added successfully");
        }}  
      />
        
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{supplierToDelete?.supplier_name}"? This action cannot be undone.
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

export default SupplierMain;
