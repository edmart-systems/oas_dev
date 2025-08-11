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
import SupplierForm from "@/components/dashboard/inventory/supplier/SupplierForm";
import { toast } from "react-toastify";
import { SupplierDtoInput } from "@/modules/inventory/dtos/supplier.dto";
import { useEffect } from "react";



interface Supplier extends SupplierDtoInput{
  supplier_id: number
}



const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchSuppliers();
  }, []);

  

   const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/inventory/supplier');
      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  

 
  const [openDialog, setOpenDialog] = useState({
  supplier: false
});

const handleDialogOpen = (type: keyof typeof openDialog) =>
    setOpenDialog({ ...openDialog, [type]: true });

const handleDialogClose = (type: keyof typeof openDialog) =>
    setOpenDialog({ ...openDialog, [type]: false });

 
const handleEdit = (supplier: Supplier) => {
  setEditingSupplier(supplier);
  handleDialogOpen('supplier');
};
const [deleteOpen, setDeleteOpen] = useState(false);
const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

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
    
    fetchSuppliers();
    toast.success('Supplier deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Failed to delete supplier');
  } finally {
    setDeleteOpen(false);
    setSupplierToDelete(null);
  }
};

  const filteredSuppliers = suppliers.filter(supplier =>
  supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  supplier.supplier_tinNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase())
);


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
              <Button variant="contained" startIcon={<Plus />} onClick={() => handleDialogOpen('supplier')}>
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
                  <TableCell>Address</TableCell>
                  <TableCell>TIN Number</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
               <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.supplier_id}>
                    <TableCell>{supplier.supplier_name}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Envelope size={14} />
                          <span style={{ fontSize: '0.875rem' }}>{supplier.supplier_email}</span>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Phone size={14} />
                          <span style={{ fontSize: '0.875rem' }}>{supplier.supplier_phone}</span>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>{supplier.supplier_address}</TableCell>
                    <TableCell>{supplier.supplier_tinNumber}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(supplier)}>
                        <PencilSimple />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(supplier)} color="error">
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
        
        <SupplierForm
        open={openDialog.supplier}
        onClose={() => {
          handleDialogClose('supplier');
          setEditingSupplier(null); // reset after close
        }}
        onSuccess={(newSupplier) => {
          toast.success(editingSupplier ? 'Supplier updated successfully' : 'Supplier added successfully');
          fetchSuppliers();
          setEditingSupplier(null);
        }}
        initialData={editingSupplier}
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

export default SuppliersPage;

