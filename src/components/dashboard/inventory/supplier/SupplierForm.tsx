import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material';

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newSupplier: any) => void;
  initialData?: any;
}

const SupplierForm = ({ open, onClose, onSuccess, initialData }: SupplierFormProps) => {
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_email: '',
    supplier_phone: '',
    supplier_address: '',
    supplier_tinNumber: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  

  useEffect(() => {
    if (initialData) {
      setFormData({
        supplier_name: initialData.supplier_name || '',
        supplier_email: initialData.supplier_email || '',
        supplier_phone: initialData.supplier_phone || '',
        supplier_address: initialData.supplier_address || '',
        supplier_tinNumber: initialData.supplier_tinNumber?.toString() || ''
      });
    } else {
      setFormData({
        supplier_name: '',
        supplier_email: '',
        supplier_phone: '',
        supplier_address: '',
        supplier_tinNumber: ''
      });
    }
    setFormError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    const submitData = {
      ...formData,
      supplier_tinNumber: parseInt(formData.supplier_tinNumber) || 0
    };
    
    try {
      const isUpdate = initialData?.supplier_id;
      const url = isUpdate ? `/api/inventory/supplier/${initialData.supplier_id}` : '/api/inventory/supplier';
      const method = isUpdate ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setFormError(errorData?.message || errorData?.error || `Failed to${isUpdate ? ' update' : ' add'} category`);
        return;
      };
      
      const newSupplier = await res.json();
      onSuccess(newSupplier);
      onClose();
    } catch (error:any) {
      setFormError(error.message || error.error || "An unexpected error occurred.");
      console.error(`Error ${initialData ? 'updating' : 'adding'} supplier:`, error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" key={initialData?.supplier_id || 'new'}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData?.supplier_id  ? 'Edit Supplier' : 'Add Supplier'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 500 }}>
            <TextField
              label="Supplier Name"
              fullWidth
              value={formData.supplier_name}
              onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              required
               
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.supplier_email}
              onChange={(e) => setFormData({ ...formData, supplier_email: e.target.value })}
              required
              error={!!formError}
              helperText={formError}
            />
            <TextField
              label="Phone"
              fullWidth
              value={formData.supplier_phone}
              onChange={(e) => setFormData({ ...formData, supplier_phone: e.target.value })}
              error={!!formError}
              helperText={formError}
            />
            <TextField
              label="TIN Number"
              type="number"
              fullWidth
              value={formData.supplier_tinNumber}
              onChange={(e) => setFormData({ ...formData, supplier_tinNumber: e.target.value })}
              error={!!formError}
              helperText={formError}
            />
            <TextField
              label="Address"
              multiline
              rows={2}
              fullWidth
              value={formData.supplier_address}
              onChange={(e) => setFormData({ ...formData, supplier_address: e.target.value })}
              error={!!formError}
              helperText={formError}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData?.supplier_id ? 'Update' : 'Add'} Supplier
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default SupplierForm;
