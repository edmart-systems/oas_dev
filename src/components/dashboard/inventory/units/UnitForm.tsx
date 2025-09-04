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
import StraightenIcon from '@mui/icons-material/Straighten';
import DescriptionIcon from '@mui/icons-material/Description';
import ShortTextIcon from '@mui/icons-material/ShortText';
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

  const muiTheme = useTheme();

  const colors = {
    primary: "#D98219",
    secondary: muiTheme.palette.info.main,
    success: muiTheme.palette.success.main,
    warning: muiTheme.palette.primary.main,
    error: muiTheme.palette.error.main,
    background: muiTheme.palette.mode === "dark" ? muiTheme.palette.background.default : "#fafafa",
  };

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
            <StraightenIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="div" fontWeight="600">
              {initialData?.unit_id ? 'Edit Unit' : 'Add New Unit'}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: colors.background }}>
          <Box sx={{ p: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <StraightenIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Unit Details
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Unit Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StraightenIcon sx={{ color: colors.primary }} />
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
                    label="Short Name"
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ShortTextIcon sx={{ color: colors.primary }} />
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
                    label="Description"
                    value={formData.unit_desc}
                    onChange={(e) => setFormData({ ...formData, unit_desc: e.target.value })}
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon sx={{ color: colors.primary }} />
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
            {initialData?.unit_id ? 'Update Unit' : 'Create Unit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UnitForm;
