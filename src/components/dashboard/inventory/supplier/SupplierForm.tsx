import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid2 } from '@mui/material';
import { saveOrUpdate } from '../form-handlers';
import { Card, CardContent, Typography } from '@mui/material';

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier?: any;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ open, onClose, onSuccess, supplier }) => {
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_email: '',
    supplier_phone: '',
    supplier_address: '',
    supplier_tinNumber: ''
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplier_name: supplier.supplier_name || '',
        supplier_email: supplier.supplier_email || '',
        supplier_phone: supplier.supplier_phone || '',
        supplier_address: supplier.supplier_address || '',
        supplier_tinNumber: supplier.supplier_tinNumber?.toString() || ''
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
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      supplier_tinNumber: parseInt(formData.supplier_tinNumber) || 0
    };
    
    try {
      await saveOrUpdate({
        endpoint: '/api/inventory/suppliers',
        data: submitData,
        id: supplier?.id,
        onSuccess: () => {
          onSuccess();
          onClose();
        }
      });
    } catch (error) {
      // Error is already handled in saveOrUpdate
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{supplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                label="Supplier Name"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                required
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.supplier_email}
                onChange={(e) => setFormData({ ...formData, supplier_email: e.target.value })}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.supplier_phone}
                onChange={(e) => setFormData({ ...formData, supplier_phone: e.target.value })}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                label="TIN Number"
                type="number"
                value={formData.supplier_tinNumber}
                onChange={(e) => setFormData({ ...formData, supplier_tinNumber: e.target.value })}
              />
            </Grid2>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={formData.supplier_address}
                onChange={(e) => setFormData({ ...formData, supplier_address: e.target.value })}
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {supplier ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SupplierForm;