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
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LabelIcon from '@mui/icons-material/Label';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (newTag: any) => void;
  initialData?: any;
}

const TagForm: React.FC<Props> = ({ open, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    tag: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const muiTheme = useTheme();

  const colors = {
    primary: "#D98219",
    secondary: muiTheme.palette.info.main,
    success: muiTheme.palette.success.main,
    warning: muiTheme.palette.primary.main,
    error: muiTheme.palette.error.main,
    background: muiTheme.palette.mode === "dark" ? muiTheme.palette.background.default : "#fafafa",
    surface: muiTheme.palette.background.paper,
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        tag: initialData.tag || ''
      });
    } else {
      setFormData({
        tag: ''
      });
    }
    setFormError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const submitData = { ...formData };

    try {
      const isUpdate = initialData?.tag_id;
      const url = isUpdate ? `/api/inventory/tag/${initialData.tag_id}` : '/api/inventory/tag';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setFormError(errorData?.message || errorData?.error || `Failed to${isUpdate ? ' update' : ' add'} tag`);
        return;
      }

      const newTag = await res.json();
      onSuccess(newTag);
      onClose();
    } catch (error: any) {
      setFormError(error.message || error?.error || "An unexpected error occurred.");
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
            <LocalOfferIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="div" fontWeight="600">
              {initialData?.tag ? 'Edit Tag' : 'Add New Tag'}
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
                <LabelIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Tag Information
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Tag Name"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    required
                    error={!!formError}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOfferIcon sx={{ color: colors.primary }} />
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
            {initialData?.tag ? 'Update Tag' : 'Create Tag'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TagForm;
