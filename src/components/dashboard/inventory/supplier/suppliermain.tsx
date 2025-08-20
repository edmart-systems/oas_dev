"use client";

import { useState } from "react";
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
} from "@mui/material";
import { Plus, PencilSimple, Trash, MagnifyingGlass, Phone, Envelope } from "@phosphor-icons/react";
import SupplierForm from "@/components/dashboard/inventory/supplier/SupplierForm";
import { toast } from "react-toastify";
import { SupplierDtoInput } from "@/modules/inventory/dtos/supplier.dto";
import { useEffect } from "react";
import { Supplier } from "@/modules/inventory/types/supplier.types";
import SupplierTable from "./supplierTable";
import MyCircularProgress from "@/components/common/my-circular-progress";
import { PlusIcon } from "lucide-react";




const SupplierMain = () => {
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
    <Stack spacing={3} >
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
              <Button variant="contained" disabled={loading} startIcon={<PlusIcon />} onClick={handleAdd}>
                Add Supplier
              </Button>
            </Stack>
          }
        />
        <CardContent>
             {loading ? (
           <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <MyCircularProgress />
            </Box>
        ) : (
            <SupplierTable suppliers={filteredSuppliers} onEdit={handleEdit} onDelete={handleDeleteClick}/>
        )}
        
        </CardContent>
        <SupplierForm
        open={openForm}
        initialData={selectedSupplier}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
            fetchData()
            setOpenForm(false);
            toast.success("Supplier added successfully") 
        }}  
      />
      </Card>
        
        
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
            Are you sure you want to delete &quot;{supplierToDelete?.supplier_name}&quot;? This action cannot be undone.
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

