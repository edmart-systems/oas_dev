import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Stack, TextField } from '@mui/material';
import { PlusIcon as Plus } from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import MyCircularProgress from '@/components/common/my-circular-progress';
import CurrencyForm from './CurrencyForm';
import CurrencyTable, { CurrencyRow } from './CurrencyTable';

const CurrencyMain: React.FC = () => {
  const [currencies, setCurrencies] = useState<CurrencyRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<CurrencyRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/currency');
      if (!res.ok) throw new Error('Failed to fetch currencies');
      const data: CurrencyRow[] = await res.json();
      setCurrencies(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch currencies');
    } finally {
      setLoading(false);
    }
  };

  const filtered = currencies.filter((c) =>
    (c.currency_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.currency_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (c: CurrencyRow) => {
    setSelected(c);
    setOpenForm(true);
  };

  return (
    <Card>
      <CardHeader
        title="Currencies"
        action={
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search currencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="contained" disabled={loading} startIcon={<Plus />} onClick={handleAdd}>
              Add Currency
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
          <CurrencyTable currencies={filtered} onEdit={handleEdit} />
        )}
      </CardContent>

      <CurrencyForm
        open={openForm}
        currency={selected || undefined}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          fetchData();
          setOpenForm(false);
          toast.success(selected ? 'Currency updated successfully' : 'Currency added successfully');
        }}
      />
    </Card>
  );
};

export default CurrencyMain;
