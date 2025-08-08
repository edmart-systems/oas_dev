import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid2 } from '@mui/material';
import { saveOrUpdate } from '../form-handlers';

interface UnitFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const UnitForm: React.FC<UnitFormProps> = ({ open, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    unit: ''
  });

useEffect(()=>{
  if(initialData){
    setFormData({
      unit: initialData.unit || ''
    });
  }
}), [initialData];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/inventory/tag');
      if (!res.ok) throw new Error('Failed to save unit');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving unit:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData.unit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData.unit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UnitForm;