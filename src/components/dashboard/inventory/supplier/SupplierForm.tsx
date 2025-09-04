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
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newSupplier: any) => void;
  initialData?: any;
}

const SupplierForm = ({ open, onClose, onSuccess, initialData }: SupplierFormProps) => {
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_email: '',
    supplier_phone: '',
    supplier_address: '',
    supplier_tinNumber: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

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
    if (initialData) {
      setFormData({
        supplier_name: initialData.supplier_name || '',
        supplier_email: initialData.supplier_email || '',
        supplier_phone: initialData.supplier_phone || '',
        supplier_address: initialData.supplier_address || '',
        supplier_tinNumber: initialData.supplier_tinNumber?.toString() || ''
      });
    } else {
      setFormData({
        supplier_name: '',
        supplier_email: '',
        supplier_phone: '',
        supplier_address: '',
        supplier_tinNumber: ''
      });
    }
    setFormError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    const submitData = {
      ...formData,
      supplier_tinNumber: parseInt(formData.supplier_tinNumber) || 0
    };
    
    try {
      const isUpdate = initialData?.supplier_id;
      const url = isUpdate ? `/api/inventory/supplier/${initialData.supplier_id}` : '/api/inventory/supplier';
      const method = isUpdate ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setFormError(errorData?.message || errorData?.error || `Failed to${isUpdate ? ' update' : ' add'} supplier`);
        return;
      }
      
      const newSupplier = await res.json();
      onSuccess(newSupplier);
      onClose();
    } catch (error: any) {
      setFormError(error.message || error.error || "An unexpected error occurred.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
            <BusinessIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="div" fontWeight="600">
              {initialData?.supplier_id ? 'Edit Supplier' : 'Add New Supplier'}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: colors.background }}>
          {formError && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                m: 3,
                backgroundColor: colors.error + '10',
                border: `1px solid ${colors.error}40`,
                borderRadius: 2
              }}
            >
              <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
                {formError}
              </Typography>
            </Paper>
          )}

          <Box sx={{ p: 3 }}>
            {/* Basic Information Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <PersonIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Basic Information
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Supplier Name"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon sx={{ color: colors.primary }} />
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
                    label="TIN Number"
                    type="number"
                    value={formData.supplier_tinNumber}
                    onChange={(e) => setFormData({ ...formData, supplier_tinNumber: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptIcon sx={{ color: colors.primary }} />
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

            {/* Contact Information Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <PhoneIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Contact Information
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.supplier_email}
                    onChange={(e) => setFormData({ ...formData, supplier_email: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: colors.primary }} />
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
                    label="Phone"
                    value={formData.supplier_phone}
                    onChange={(e) => setFormData({ ...formData, supplier_phone: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: colors.primary }} />
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

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={formData.supplier_address}
                    onChange={(e) => setFormData({ ...formData, supplier_address: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: colors.primary }} />
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
            {initialData?.supplier_id ? 'Update Supplier' : 'Create Supplier'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SupplierForm;
