import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid2 } from '@mui/material';


interface UnitFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newCategory: any) => void;
  initialData?: any;
}

const CategoryForm: React.FC<UnitFormProps> = ({ open, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    category: ''
  });

useEffect(()=>{
  if(initialData){
    setFormData({
      category: initialData.category || ''
    });
  }
}), [initialData];


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
    };
    
    try {
      const res = await fetch('/api/inventory/category',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!res.ok) throw new Error('Failed to save category');

      const newCategory = await res.json();
      onSuccess(newCategory);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          { initialData?.category ? 'Edit Category' : 'Add Category'}

        </DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData?.category ? 'Update' : 'Add'} 
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryForm;