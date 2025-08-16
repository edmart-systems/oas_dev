import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid2 } from '@mui/material';

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
  const [formError, setFormError] = useState<string | null>(null); // Add error state

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
        setFormError(errorData?.message || `Failed to${isUpdate ? ' update' : ' add'} tag`);
        return;
      }

      const newTag = await res.json();
      onSuccess(newTag);
      onClose();
    } catch (error: any) {
      setFormError(error.message || "An unexpected error occurred.");
      console.error(`Error ${initialData ? 'updating' : 'adding'}tag:`, error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth key={initialData?.tag_id || 'new'}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData?.tag ? 'Edit Tag' : 'Add Tag'}
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
                error={!!formError}
                helperText={formError}
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData?.tag ? 'Update' : 'Add'} Tag
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TagForm;
