'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Paper,
  Box,
  Fade,
  InputAdornment,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
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

  const muiTheme = useTheme();

  const colors = {
    primary: "#D98219",
    secondary: muiTheme.palette.info.main,
    success: muiTheme.palette.success.main,
    warning: muiTheme.palette.warning.main,
    error: muiTheme.palette.error.main,
    background: muiTheme.palette.mode === "dark" ? muiTheme.palette.background.default : "#fafafa",
  };

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14)',
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
            color: 'white',
            textAlign: 'center',
            py: 3,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <AttachMoneyIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="div" fontWeight="600">
              {currency ? 'Edit Currency' : 'Add New Currency'}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: colors.background }}>
          <Box sx={{ p: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <MonetizationOnIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Currency Details
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Currency Code"
                    placeholder="e.g., USD, EUR, GBP"
                    value={formData.currency_code}
                    onChange={(e) => setFormData({ ...formData, currency_code: e.target.value.toUpperCase() })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon sx={{ color: colors.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: colors.primary },
                      }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Currency Name"
                    placeholder="e.g., US Dollar, Euro, British Pound"
                    value={formData.currency_name}
                    onChange={(e) => setFormData({ ...formData, currency_name: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MonetizationOnIcon sx={{ color: colors.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: colors.primary },
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 2,
              px: 4,
              borderColor: colors.primary + '40',
              color: colors.primary,
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: colors.primary + '05'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              borderRadius: 2,
              px: 4,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
              boxShadow: `0 4px 12px ${colors.primary}40`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.primary}dd 0%, ${colors.primary}bb 100%)`,
                boxShadow: `0 6px 16px ${colors.primary}50`,
              }
            }}
          >
            {currency ? 'Update Currency' : 'Create Currency'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CurrencyForm;
