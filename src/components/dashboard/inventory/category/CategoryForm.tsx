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
  const [formError, setFormError] = useState<string | null>(null);

useEffect(()=>{
  if(initialData){
    setFormData({
      category: initialData.category || ''
    });
  }else {
      setFormData({
        category: ''
      });
  }
  setFormError(null);
}, [initialData, open]);


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const submitData = {
      ...formData,
    };
    
    try {
      const isUpdate = initialData?.category_id;
      const url = isUpdate ? `/api/inventory/category/${initialData.tag_id}` : '/api/inventory/category';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!res.ok){
        const errorData = await res.json().catch(() => ({}));
        setFormError(errorData?.message || errorData?.error || `Failed to${isUpdate ? ' update' : ' add'} category`);
        return;
      };

      const newCategory = await res.json();
      onSuccess(newCategory);
      onClose();
    } catch (error: any) {
      setFormError(error.message || error.error || "An unexpected error occurred.");
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
                error={!!formError}
                helperText={formError}
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