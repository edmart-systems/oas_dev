import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid2 } from '@mui/material';
import { saveOrUpdate } from '../form-handlers';

interface TagFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tag?: any;
}

const TagForm: React.FC<TagFormProps> = ({ open, onClose, onSuccess, tag }) => {
  const [formData, setFormData] = useState({
    tag: ''
  });

  useEffect(() => {
    if (tag) {
      setFormData({
        tag: tag.tag || ''
      });
    } else {
      setFormData({ tag: '' });
    }
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveOrUpdate({
        endpoint: '/api/inventory/tags',
        data: formData,
        id: tag?.id,
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
        <DialogTitle>{tag ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Tag"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                required
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {tag ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TagForm;