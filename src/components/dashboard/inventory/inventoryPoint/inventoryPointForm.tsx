import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid2,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (newLocation: any) => void;
  initialData?: any;
}

const InventoryPointForm: React.FC<Props> = ({ open, onClose, onSuccess, initialData }) => {
  const [locations, setLocations] = useState([{
    id: Date.now(),
    location_name: '',
    location_type: 'INVENTORY_POINT',
    location_parent_id: '',
    location_address: '',
    assigned_to: ''
  }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [parentLocations, setParentLocations] = useState<any[]>([]);
  const [role2Users, setRole2Users] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchParentLocations();
      fetchRole2Users();
    }
    
    if (initialData) {
      setLocations([{
        id: Date.now(),
        location_name: initialData.location_name || '',
        location_type: initialData.location_type || 'INVENTORY_POINT',
        location_parent_id: initialData.location_parent_id?.toString() || '',
        location_address: initialData.location_address || '',
        assigned_to: initialData.assigned_to || ''
      }]);
    } else {
      setLocations([{
        id: Date.now(),
        location_name: '',
        location_type: 'INVENTORY_POINT',
        location_parent_id: '',
        location_address: '',
        assigned_to: ''
      }]);
    }
    setFormError(null);
  }, [initialData, open]);

  const fetchParentLocations = async () => {
    try {
      const res = await fetch('/api/inventory/inventory_point');
      const locations = await res.json();
      
      if (Array.isArray(locations)) {
        // Filter to show only MAIN_STORE and BRANCH as potential parents
        const validParents = locations.filter((loc: any) => 
          loc.location_type === 'MAIN_STORE' || loc.location_type === 'BRANCH'
        );
        setParentLocations(validParents);
      }
    } catch (error) {
      console.error('Failed to fetch parent locations:', error);
    }
  };

  const fetchRole2Users = async () => {
    try {
      const res = await fetch('/api/user?role=2');
      
      if (!res.ok) {
        console.error('User API error:', res.status, res.statusText);
        return;
      }
      
      const users = await res.json();
      
      if (Array.isArray(users)) {
        setRole2Users(users);
      }
    } catch (error) {
      console.error('Failed to fetch role 2 users:', error);
    }
  };

  const addLocation = () => {
    setLocations([...locations, {
      id: Date.now(),
      location_name: '',
      location_type: 'INVENTORY_POINT',
      location_parent_id: '',
      location_address: '',
      assigned_to: ''
    }]);
  };

  const removeLocation = (id: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const updateLocation = (id: number, field: string, value: string) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const results = [];
      
      for (const location of locations) {
        if (!location.location_name.trim()) {
          setFormError('All locations must have a name');
          return;
        }

        const submitData = {
          location_name: location.location_name,
          location_type: location.location_type,
          location_parent_id: location.location_parent_id ? Number(location.location_parent_id) : null,
          location_address: location.location_address || null,
          assigned_to: location.assigned_to || null
        };

        const isUpdate = initialData?.location_id;
        const url = isUpdate ? `/api/inventory/inventory_point/${initialData.location_id}` : '/api/inventory/inventory_point';
        const method = isUpdate ? 'PATCH' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          setFormError(`Failed to ${isUpdate ? 'update' : 'add'} ${location.location_name}: ${errorData?.message || errorData?.error}`);
          return;
        }

        const newLocation = await res.json();
        results.push(newLocation);
      }

      onSuccess(results);
      onClose();
    } catch (error: any) {
      setFormError(error.message || error.error || "An unexpected error occurred.");
      console.error('Error processing locations:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData?.location_id ? 'Edit Location' : 'Add Locations'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Locations</Typography>
            <Button startIcon={<Add />} onClick={addLocation} variant="outlined" size="small">
              Add Location
            </Button>
          </Box>
          
          {formError && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {formError}
            </Typography>
          )}

          {locations.map((location, index) => (
            <Card key={location.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Location {index + 1}</Typography>
                  {locations.length > 1 && (
                    <IconButton onClick={() => removeLocation(location.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  )}
                </Box>
                
                <Grid2 container spacing={2}>
                  <Grid2 size={12}>
                    <TextField
                      fullWidth
                      label="Location Name"
                      value={location.location_name}
                      onChange={(e) => updateLocation(location.id, 'location_name', e.target.value)}
                      required
                    />
                  </Grid2>
                  
                  <Grid2 size={6}>
                    <FormControl fullWidth>
                      <InputLabel>Location Type</InputLabel>
                      <Select
                        value={location.location_type}
                        label="Location Type"
                        onChange={(e) => updateLocation(location.id, 'location_type', e.target.value)}
                      >
                        <MenuItem value="MAIN_STORE">Main Store</MenuItem>
                        <MenuItem value="BRANCH">Branch</MenuItem>
                        <MenuItem value="INVENTORY_POINT">Inventory Point</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid2>

                  <Grid2 size={6}>
                    <FormControl fullWidth>
                      <InputLabel>Assigned To</InputLabel>
                      <Select
                        value={location.assigned_to}
                        label="Assigned To"
                        onChange={(e) => updateLocation(location.id, 'assigned_to', e.target.value)}
                      >
                        <MenuItem value="">None</MenuItem>
                        {role2Users.map(user => (
                          <MenuItem key={user.co_user_id} value={user.co_user_id}>
                            {user.firstName} {user.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid2>

                  {(location.location_type === 'BRANCH' || location.location_type === 'INVENTORY_POINT') && (
                    <Grid2 size={12}>
                      <FormControl fullWidth>
                        <InputLabel>Parent Location</InputLabel>
                        <Select
                          value={location.location_parent_id}
                          label="Parent Location"
                          onChange={(e) => updateLocation(location.id, 'location_parent_id', e.target.value)}
                          required
                        >
                          {parentLocations
                            .filter(loc => {
                              if (location.location_type === 'BRANCH') {
                                return loc.location_type === 'MAIN_STORE';
                              }
                              if (location.location_type === 'INVENTORY_POINT') {
                                return loc.location_type === 'BRANCH';
                              }
                              return false;
                            })
                            .map(loc => (
                              <MenuItem key={loc.location_id} value={loc.location_id.toString()}>
                                {loc.location_name} ({loc.location_type})
                              </MenuItem>
                            ))
                          }
                        </Select>
                      </FormControl>
                    </Grid2>
                  )}

                  <Grid2 size={12}>
                    <TextField
                      fullWidth
                      label="Address (Optional)"
                      value={location.location_address}
                      onChange={(e) => updateLocation(location.id, 'location_address', e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData?.location_id ? 'Update Location' : `Add ${locations.length} Location${locations.length > 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryPointForm;