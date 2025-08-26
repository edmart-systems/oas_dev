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
    currency_code: '',
    currency_name: '',
  });

  useEffect(() => {
    if (currency) {
      setFormData({
        currency_code: currency.currency_code || '',
        currency_name: currency.currency_name || '',
      });
    } else {
      setFormData({ currency_code: '', currency_name: '' });
    }
  }, [currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveOrUpdate({
        endpoint: '/api/inventory/currency',
        data: formData,
        id: currency?.currency_id,
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
                label="Currency Code (e.g., USD)"
                value={formData.currency_code}
                onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                required
              />
            </Grid2>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Currency Name (e.g., US Dollar)"
                value={formData.currency_name}
                onChange={(e) => setFormData({ ...formData, currency_name: e.target.value })}
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