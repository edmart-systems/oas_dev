"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { LocationResponseDto } from '@/modules/inventory/dtos/location.dto';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box
} from '@mui/material';

const LocationSetting = () => {
  const { currentLocationId, setCurrentLocation, loading } = useCurrentLocation();
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/inventory/location');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (currentLocationId) {
      setSelectedLocationId(currentLocationId);
    }
  }, [currentLocationId]);

  const handleSave = async () => {
    if (!selectedLocationId) return;

    setSaving(true);
    
    // Find the selected location and get the lowest level in its hierarchy
    const selectedLocation = locations.find(loc => loc.location_id === selectedLocationId);
    if (!selectedLocation) {
      toast('Selected location not found', { type: 'error' });
      setSaving(false);
      return;
    }

    // Find the lowest level location in the hierarchy
    let targetLocationId = selectedLocationId;
    
    // If MAIN_STORE is selected, find its lowest child
    if (selectedLocation.location_type === 'MAIN_STORE') {
      const branches = locations.filter(loc => loc.location_parent_id === selectedLocationId);
      if (branches.length > 0) {
        // Find inventory points under branches
        for (const branch of branches) {
          const inventoryPoints = locations.filter(loc => loc.location_parent_id === branch.location_id);
          if (inventoryPoints.length > 0) {
            targetLocationId = inventoryPoints[0].location_id; // Use first inventory point
            break;
          }
        }
        // If no inventory points, use first branch
        if (targetLocationId === selectedLocationId) {
          targetLocationId = branches[0].location_id;
        }
      }
    }
    
    // If BRANCH is selected, find its lowest child (inventory point)
    if (selectedLocation.location_type === 'BRANCH') {
      const inventoryPoints = locations.filter(loc => loc.location_parent_id === selectedLocationId);
      if (inventoryPoints.length > 0) {
        targetLocationId = inventoryPoints[0].location_id; // Use first inventory point
      }
    }
    
    // INVENTORY_POINT is already the lowest level, use as is
    
    const success = await setCurrentLocation(targetLocationId);
    
    if (success) {
      toast('Location setting updated successfully', { type: 'success' });
    } else {
      toast('Failed to update location setting', { type: 'error' });
    }
    setSaving(false);
  };

  if (loading) {
    return <Typography>Loading location settings...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Location Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Set the default location for all inventory operations
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Current Location</InputLabel>
        <Select
          value={selectedLocationId || ''}
          onChange={(e) => setSelectedLocationId(Number(e.target.value))}
          label="Current Location"
        >
          {locations.map((location) => (
            <MenuItem key={location.location_id} value={location.location_id}>
              {location.location_name} ({location.location_type.replace('_', ' ')})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving || !selectedLocationId || selectedLocationId === currentLocationId}
      >
        {saving ? 'Saving...' : 'Save Location Setting'}
      </Button>
    </Box>
  );
};

export default LocationSetting;