import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid2 } from '@mui/material';


interface UnitFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newTag: any) => void;
  initialData?: any;
}

const TagForm: React.FC<UnitFormProps> = ({ open, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    tag: ''
  });

useEffect(()=>{
  if(initialData){
    setFormData({
      tag: initialData.tag || ''
    });
  }
}), [initialData];


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
    };
    
    try {
      const res = await fetch('/api/inventory/tag',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!res.ok) throw new Error('Failed to save tag');

      const newTag = await res.json();
      onSuccess(newTag);
      onClose();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          { initialData?.tag ? 'Edit Tag' : 'Add Tag'}

        </DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Tag"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                required
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData?.tag ? 'Update' : 'Add'} 
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TagForm;