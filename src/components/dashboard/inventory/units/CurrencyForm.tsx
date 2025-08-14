import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid2 } from '@mui/material';
import { saveOrUpdate } from '../form-handlers';

interface CurrencyFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currency?: any;
}

const CurrencyForm: React.FC<CurrencyFormProps> = ({ open, onClose, onSuccess, currency }) => {
  const [formData, setFormData] = useState({
    currency: ''
  });

  useEffect(() => {
    if (currency) {
      setFormData({
        currency: currency.currency || ''
      });
    } else {
      setFormData({ currency: '' });
    }
  }, [currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveOrUpdate({
        endpoint: '/api/inventory/currencies',
        data: formData,
        id: currency?.id,
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
        <DialogTitle>{currency ? 'Edit Currency' : 'Add Currency'}</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                required
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {currency ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CurrencyForm;