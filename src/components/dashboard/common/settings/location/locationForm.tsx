import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from '@mui/material';
import { LocationType } from '@prisma/client';
import { getAllowedLocationTypes, canSelectParent, UserRoleId } from '@/utils/location-role.utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (newLocation: any) => void;
  initialData?: any;
  locations?: { location_id: number; location_name: string; location_type: LocationType }[];
  userRole?: UserRoleId;
}

const LocationForm = ({
  open,
  onClose,
  onSuccess,
  initialData,
  locations = [],
  userRole = 2,
}: Props) => {
  const [formData, setFormData] = useState({
    location_name: '',
    location_type: 'MAIN_STORE' as LocationType,
    location_parent_id: '',
    location_address: '',
    is_active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        location_name: initialData.location_name || '',
        location_type: initialData.location_type || 'MAIN_STORE',
        location_parent_id: initialData.location_parent_id?.toString() || '',
        location_address: initialData.location_address || '',
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData({
        location_name: '',
        location_type: 'MAIN_STORE',
        location_parent_id: '',
        location_address: '',
        is_active: true,
      });
    }
    setFormError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!formData.location_name) {
      setFormError('Location name is required');
      return;
    }
    if (!formData.location_type) {
      setFormError('Location type is required');
      return;
    }
    
    const submitData = {
      ...formData,
      location_parent_id: formData.location_parent_id ? Number(formData.location_parent_id) : undefined,
      is_active: Boolean(formData.is_active),
    };
    try {
      // POST or PATCH depending on initialData
      const isUpdate = !!initialData?.location_id;
      const url = isUpdate
        ? `/api/inventory/location/${initialData.location_id}`
        : '/api/inventory/location';
      const method = isUpdate ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err?.message || err?.error || `Failed to${isUpdate ? ' update' : ' add'} location`);
        return;
      }
      const newLocation = await res.json();
      onSuccess(newLocation);
      onClose();
    } catch (error: any) {
      setFormError(error.message || error?.error || 'Unexpected error');
    }
  };

  // Use utility for allowed types
  const locationTypeOptions = getAllowedLocationTypes(userRole);

  // Parent logic
  let parentOptions: { location_id: number; location_name: string }[] = [];
  let parentLabel = '';
  let parentDisabled = !canSelectParent(userRole, formData.location_type);

  if (formData.location_type === 'BRANCH') {
    parentOptions = locations.filter(loc => loc.location_type === 'MAIN_STORE');
    parentLabel = 'Parent (Main Store)';
  } else if (formData.location_type === 'INVENTORY_POINT') {
    parentOptions = locations.filter(loc => loc.location_type === 'BRANCH');
    parentLabel = 'Parent (Branch)';
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth key={initialData?.location_id || 'new'}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData?.location_id ? 'Edit Location' : 'Add Location'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Location Name"
              value={formData.location_name}
              onChange={e => setFormData({ ...formData, location_name: e.target.value })}
              required
              error={!!formError && !formData.location_name}
              helperText={!!formError && !formData.location_name ? formError : ''}
            />
            <TextField
              select
              fullWidth
              label="Location Type"
              value={formData.location_type}
              onChange={e => setFormData({ ...formData, location_type: e.target.value as LocationType, location_parent_id: '' })}
              required
            >
              {locationTypeOptions.map(type => (
                <MenuItem key={type} value={type}>
                  {type === 'MAIN_STORE' ? 'Main Store' : type === 'BRANCH' ? 'Branch' : 'Inventory Point'}
                </MenuItem>
              ))}
            </TextField>
            {(formData.location_type === 'BRANCH' || formData.location_type === 'INVENTORY_POINT') && (
              <TextField
                select
                fullWidth
                label={parentLabel}
                value={formData.location_parent_id}
                onChange={e => setFormData({ ...formData, location_parent_id: e.target.value })}
                required
                disabled={parentDisabled}
                helperText={parentDisabled ? 'You do not have permission to select parent for this location type.' : ''}
              >
                {parentOptions.map(opt => (
                  <MenuItem key={opt.location_id} value={opt.location_id}>
                    {opt.location_name}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              fullWidth
              label="Address"
              value={formData.location_address}
              onChange={e => setFormData({ ...formData, location_address: e.target.value })}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData?.location_id ? 'Update' : 'Add'} Location
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LocationForm;