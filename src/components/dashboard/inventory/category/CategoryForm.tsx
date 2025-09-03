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
import CategoryIcon from '@mui/icons-material/Category';
import FolderIcon from '@mui/icons-material/Folder';

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
        category: initialData.category || ''
      });
    } else {
      setFormData({
        category: ''
      });
    }
    setFormError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const submitData = { ...formData };

    try {
      const isUpdate = initialData?.category_id;
      const url = isUpdate ? `/api/inventory/category/${initialData.category_id}` : '/api/inventory/category';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setFormError(errorData?.message || errorData?.error || `Failed to${isUpdate ? ' update' : ' add'} category`);
        return;
      }

      const newCategory = await res.json();
      onSuccess(newCategory);
      onClose();
    } catch (error: any) {
      setFormError(error.message || error.error || "An unexpected error occurred.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
            <CategoryIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="div" fontWeight="600">
              {initialData?.category ? 'Edit Category' : 'Add New Category'}
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
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <FolderIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Category Information
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    error={!!formError}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon sx={{ color: colors.primary }} />
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
            {initialData?.category ? 'Update Category' : 'Create Category'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryForm;
