import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid2 } from '@mui/material';


interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (newInventory_point: any) => void;
  initialData?: any;
}

const Inventory_pointForm: React.FC<Props> = ({ open, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    inventory_point: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

useEffect(()=>{
  if(initialData){
    setFormData({
      inventory_point: initialData.inventory_point || ''
    });
  }else{
    setFormData({
      inventory_point: ''
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
      const isUpdate = initialData?.inventory_point_id;
      const url = isUpdate ? `/api/inventory/inventory_point/${initialData.inventory_point_id}` : '/api/inventory/inventory_point';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url,{
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!res.ok){
        const errorData = await res.json().catch(() => ({}));
        setFormError(errorData?.message || errorData?.error || `Failed to${isUpdate ? ' update' : ' add'} category`);
        return;
      };

      const newInventory_point = await res.json();
      onSuccess(newInventory_point);
      onClose();
    } catch (error:any) {
      setFormError(error.message || error.error || "An unexpected error occurred.");
      console.error(`Error ${initialData ? 'updating' : 'adding'}Inventory_point:`, error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth key={initialData?.Inventory_point_id || 'new'}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          { initialData?.inventory_point ? 'Edit Inventory point' : 'Add Inventory point'}

        </DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Inventory_point"
                value={formData.inventory_point}
                onChange={(e) => setFormData({ ...formData, inventory_point: e.target.value })}
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
            {initialData?.inventory_point ? 'Update' : 'Add'} Inventory point 
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default Inventory_pointForm;