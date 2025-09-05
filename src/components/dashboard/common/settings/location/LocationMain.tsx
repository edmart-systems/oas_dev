"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { Plus, PencilSimple, Trash, MagnifyingGlass } from '@phosphor-icons/react';
import { LocationType } from '@prisma/client';
import { LocationResponseDto } from '@/modules/inventory/dtos/location.dto';
import { UserRoleId } from '@/utils/location-role.utils';
import LocationForm from './locationForm';

const LocationMain = () => {
  const { data: session } = useSession();
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationResponseDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const userRoleId = (session?.user?.role_id as UserRoleId) || 2;

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/inventory/location');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      } else {
        toast('Failed to fetch locations', { type: 'error' });
      }
    } catch (error) {
      toast('Error fetching locations', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setFormOpen(true);
  };

  const handleEdit = (location: LocationResponseDto) => {
    setEditingLocation(location);
    setFormOpen(true);
  };

  const handleDelete = async (locationId: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const response = await fetch(`/api/inventory/location/${locationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast('Location deleted successfully', { type: 'success' });
        fetchLocations();
      } else {
        const error = await response.json();
        toast(error.error || 'Failed to delete location', { type: 'error' });
      }
    } catch (error) {
      toast('Error deleting location', { type: 'error' });
    }
  };

  const handleFormSuccess = () => {
    fetchLocations();
    toast(editingLocation ? 'Location updated successfully' : 'Location created successfully', { type: 'success' });
  };

  const getLocationTypeLabel = (type: LocationType) => {
    switch (type) {
      case 'MAIN_STORE': return 'Main Store';
      case 'BRANCH': return 'Branch';
      case 'INVENTORY_POINT': return 'Inventory Point';
      default: return type;
    }
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return '-';
    const parent = locations.find(loc => loc.location_id === parentId);
    return parent ? parent.location_name : '-';
  };

  const filteredLocations = locations.filter(location =>
    location.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.location_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading locations...</div>;
  }

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="Location Management"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>
                Add Location
              </Button>
            </Stack>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLocations.map((location) => (
                  <TableRow key={location.location_id}>
                    <TableCell>{location.location_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={getLocationTypeLabel(location.location_type)}
                        color={
                          location.location_type === 'MAIN_STORE' ? 'primary' :
                          location.location_type === 'BRANCH' ? 'secondary' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getParentName(location.location_parent_id ?? null)}</TableCell>
                    <TableCell>{location.location_address || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={location.is_active ? 'Active' : 'Inactive'}
                        color={location.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(location)}>
                        <PencilSimple />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(location.location_id)} color="error">
                        <Trash />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <LocationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        initialData={editingLocation}
        locations={locations}
        userRole={userRoleId}
      />
    </Stack>
  );
};

export default LocationMain;