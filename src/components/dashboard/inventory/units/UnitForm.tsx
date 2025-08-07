import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid2 } from '@mui/material';
import { saveOrUpdate } from '../form-handlers';

interface UnitFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unit?: any;
}

const UnitForm: React.FC<UnitFormProps> = ({ open, onClose, onSuccess, unit }) => {
  const [formData, setFormData] = useState({
    unit: ''
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        unit: unit.unit || ''
      });
    } else {
      setFormData({ unit: '' });
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveOrUpdate({
        endpoint: '/api/inventory/units',
        data: formData,
        id: unit?.id,
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{unit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
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
            {unit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UnitForm;