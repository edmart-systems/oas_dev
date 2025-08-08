'use client';

import {
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import { getUnits, getCurrencies } from '@/server-actions/user-actions/inventory.actions';
import { toast } from 'react-toastify';
import UnitForm from '../units/UnitForm';
import SupplierForm from '../supplier/SupplierForm';
import CategoryForm from '../tags/CategoryForm';
import TagForm from '../tags/tagForm';
import { Currency } from 'lucide-react';
import CurrencyForm from '../units/CurrencyForm';

interface ProductFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export default function ProductForm({ onSubmit, onCancel, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    product_name: initialData?.product_name || '',
    product_barcode: initialData?.product_barcode?.toString() || '',
    product_description: initialData?.product_description || '',
    unit_id: initialData?.unit_id?.toString() || '',
    category_id: initialData?.category_id?.toString() || '',
    tag_id: initialData?.tag_id?.toString() || '',
    buying_price: initialData?.buying_price?.toString() || '',
    selling_price: initialData?.selling_price?.toString() || '',
    currency_id: initialData?.currency_id?.toString() || '',
    product_max_quantity: initialData?.product_max_quantity?.toString() || '',
    product_min_quantity: initialData?.product_min_quantity?.toString() || '',
    product_status: initialData?.product_status || 1,
    supplier_id: initialData?.supplier_id?.toString() || '',
  });

  const [units, setUnits] = useState<{id: number, name: string}[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [tags, setTags] = useState<{id: number, name: string}[]>([]);
  const [currencies, setCurrencies] = useState<{id: number, name: string}[]>([]);
  const [suppliers, setSuppliers] = useState<{id: number, name: string}[]>([]);

  const [openDialog, setOpenDialog] = useState({
    unit: false,
    category: false,
    tag: false,
    currency: false,
    supplier: false,
  });

  const handleDialogOpen = (type: keyof typeof openDialog) =>
    setOpenDialog({ ...openDialog, [type]: true });

  const handleDialogClose = (type: keyof typeof openDialog) =>
    setOpenDialog({ ...openDialog, [type]: false });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesRes, tagsRes, suppliersRes] = await Promise.all([
          fetch('/api/inventory/category'),
          fetch('/api/inventory/tag'),
          fetch('/api/inventory/supplier')
        ]);
        
        const [categoriesData, tagsData, suppliersData] = await Promise.all([
          categoriesRes.json(),
          tagsRes.json(),
          suppliersRes.json()
        ]);
        
        setCategories(categoriesData.map((cat: any) => ({ id: cat.category_id, name: cat.category })));
        setTags(tagsData.map((tag: any) => ({ id: tag.tag_id, name: tag.tag })));
        setSuppliers(suppliersData.map((sup: any) => ({ id: sup.supplier_id, name: sup.supplier_name })));
        
        // Fetch units and currencies from database using server actions
        const [unitsData, currenciesData] = await Promise.all([
          getUnits(),
          getCurrencies()
        ]);
        
        setUnits(unitsData);
        setCurrencies(currenciesData);
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    
    fetchOptions();
  }, []);

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        product_barcode: Number(formData.product_barcode),
        unit_id: Number(formData.unit_id),
        category_id: Number(formData.category_id),
        tag_id: Number(formData.tag_id),
        buying_price: Number(formData.buying_price),
        selling_price: Number(formData.selling_price),
        currency_id: Number(formData.currency_id),
        product_max_quantity: formData.product_max_quantity ? Number(formData.product_max_quantity) : null,
        product_min_quantity: formData.product_min_quantity ? Number(formData.product_min_quantity) : null,
        supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <Card sx={{ width: '100%', mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          New Product
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Product Name"
              fullWidth
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Barcode"
              type="number"
              fullWidth
              value={formData.product_barcode}
              onChange={(e) => setFormData({ ...formData, product_barcode: e.target.value })}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={formData.product_description}
              onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Buying Price"
              type="number"
              fullWidth
              value={formData.buying_price}
              onChange={(e) => setFormData({ ...formData, buying_price: e.target.value })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Selling Price"
              type="number"
              fullWidth
              value={formData.selling_price}
              onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center">
              <TextField
                label="Unit"
                select
                fullWidth
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
              >
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton onClick={() => handleDialogOpen('unit')}>
                <AddIcon />
              </IconButton>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center">
              <TextField
                label="Category"
                select
                fullWidth
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton onClick={() => handleDialogOpen('category')}>
                <AddIcon />
              </IconButton>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center">
              <TextField
                label="Tag"
                select
                fullWidth
                value={formData.tag_id}
                onChange={(e) => setFormData({ ...formData, tag_id: e.target.value })}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton onClick={() => handleDialogOpen('tag')}>
                <AddIcon />
              </IconButton>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center">
              <TextField
                label="Currency"
                select
                fullWidth
                value={formData.currency_id}
                onChange={(e) => setFormData({ ...formData, currency_id: e.target.value })}
              >
                {currencies.map((cur) => (
                  <MenuItem key={cur.id} value={cur.id}>
                    {cur.name}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton onClick={() => handleDialogOpen('currency')}>
                <AddIcon />
              </IconButton>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center">
              <TextField
                label="Supplier"
                select
                fullWidth
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              >
                {suppliers.map((sup) => (
                  <MenuItem key={sup.id} value={sup.id}>
                    {sup.name}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton onClick={() => handleDialogOpen('supplier')}>
                <AddIcon />
              </IconButton>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Max Quantity"
              type="number"
              fullWidth
              value={formData.product_max_quantity}
              onChange={(e) =>
                setFormData({ ...formData, product_max_quantity: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Min Quantity"
              type="number"
              fullWidth
              value={formData.product_min_quantity}
              onChange={(e) =>
                setFormData({ ...formData, product_min_quantity: e.target.value })
              }
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 12 }}>
            <Stack direction="row" spacing={2}>
              <Button onClick={onCancel} fullWidth>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={handleSubmit}
              >
                Save
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
      <CategoryForm
        open={openDialog.category}
        onClose={() => handleDialogClose('category')}
        onSuccess={(newCategory) => {
          const categoryOption = { id: newCategory.category_id, name: newCategory.category };
         setTags([...categories, categoryOption]);
          toast.success('Category added successfully');
         
        }}
      />
      <TagForm
        open={openDialog.tag}
        onClose={() => handleDialogClose('tag')}
        onSuccess={(newTag) => {
          const tagOption = { id: newTag.tag_id, name: newTag.tag };
         setTags([...tags, tagOption]);
          toast.success('Tag added successfully');
        }}
      />
      {/* <CurrencyForm
        open={openDialog.currency}
        onClose={() => handleDialogClose('currency')}
        onSuccess={() => {
          const currency = {id: newCurrency_id, name:newCurrency.currency};
          toast.success('Currency added successfully')
        }}
      /> */}

      {/* Supplier Dialog  */}
            <SupplierForm
        open={openDialog.supplier}
        onClose={() => handleDialogClose('supplier')}
        onSuccess={(newSupplier) => {
          const supplierOption = { id: newSupplier.supplier_id, name: newSupplier.supplier_name };
          setSuppliers([...suppliers, supplierOption]);
          toast.success('Supplier added successfully');
        }}
      />



      {/* <UnitForm
        open={openDialog.unit}
        onClose={() => handleDialogClose('unit')}
        onSuccess={() => {
          const unitOption = { id: newUnit.supplier_id, name: newUnit.supplier_name };
          setUnits([...suppliers, unitOption ]);
          toast.success('Supplier added successfully');
          
        }}
      /> */}
    </Card>
  );
}