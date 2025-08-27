import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Stack, TextField } from '@mui/material';
import { Plus } from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import MyCircularProgress from '@/components/common/my-circular-progress';
import UnitForm from './UnitForm';
import UnitTable, { UnitRow } from './UnitTable';

const UnitMain: React.FC = () => {
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<UnitRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/unit');
      if (!res.ok) throw new Error('Failed to fetch units');
      const data: UnitRow[] = await res.json();
      setUnits(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch units');
    } finally {
      setLoading(false);
    }
  };

  const filtered = units.filter((u) =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.short_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (u: UnitRow) => {
    setSelected(u);
    setOpenForm(true);
  };

  return (
    <Card>
      <CardHeader
        title="Units"
        action={
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="contained" disabled={loading} startIcon={<Plus />} onClick={handleAdd}>
              Add Unit
            </Button>
          </Stack>
        }
      />
      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <MyCircularProgress />
          </Box>
        ) : (
          <UnitTable units={filtered} onEdit={handleEdit} />
        )}
      </CardContent>

      <UnitForm
        open={openForm}
        initialData={selected || undefined}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          fetchData();
          setOpenForm(false);
          toast.success(selected ? 'Unit updated successfully' : 'Unit added successfully');
        }}
      />
    </Card>
  );
};

export default UnitMain;
