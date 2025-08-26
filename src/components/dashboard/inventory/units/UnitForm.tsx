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
    name: '',
    short_name: '',
    unit_desc: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        short_name: initialData.short_name || '',
        unit_desc: initialData.unit_desc || '',
      });
    } else {
      setFormData({ name: '', short_name: '', unit_desc: '' });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveOrUpdate({
        endpoint: '/api/inventory/unit',
        data: formData,
        id: initialData?.unit_id,
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      });
    } catch (error) {
      // handled in saveOrUpdate
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData?.unit_id ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid2>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Short Name"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                required
              />
            </Grid2>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.unit_desc}
                onChange={(e) => setFormData({ ...formData, unit_desc: e.target.value })}
                multiline
                minRows={2}
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData?.unit_id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UnitForm;