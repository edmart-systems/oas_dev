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
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import { getUnits, getCurrencies } from '@/server-actions/user-actions/inventory.actions';
import { toast } from 'react-toastify';
import SupplierForm from '../supplier/SupplierForm';
import CategoryForm from '../category/CategoryForm';
import TagForm from '../tag/tagForm';

interface ProductFormProps {
  open: boolean;
  onSubmit: (newProduct: any) => void;
  onCancel: () => void;
  initialData?: any;
  
}

export default function ProductForm({ open, onSubmit, onCancel, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    product_name: '',
        product_barcode: '',
        product_description: '',
        unit_id: '',
        category_id: '',
        tag_id: '',
        buying_price: '',
        selling_price: '',
        currency_id: '',
        product_max_quantity: '',
        product_min_quantity: '',
        product_status: 1,
        supplier_id: '',    
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [units, setUnits] = useState<{id: number, name: string}[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [tags, setTags] = useState<{id: number, name: string}[]>([]);
  const [currencies, setCurrencies] = useState<{currency_id: number, currency_code: string, currency_name: string}[]>([]);
  const [suppliers, setSuppliers] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
 const [openForm, setOpenForm] = useState<null | 'category' | 'tag' | 'supplier'| 'currency' | 'unit'>(null);


  useEffect(()=>{
    if(initialData){
      setFormData({
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
      })

    }else{
      setFormData({
        product_name: '',
        product_barcode: '',
        product_description: '',
        unit_id: '',
        category_id: '',
        tag_id: '',
        buying_price: '',
        selling_price: '',
        currency_id: '',
        product_max_quantity: '',
        product_min_quantity: '',
        product_status: 1,
        supplier_id: '',
      })
    }
    fetchData();
    setGeneralError(null);
  }, [initialData, openForm]);

    const fetchData = async () => {

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const errors: Record<string, string> = {};
    if (!formData.product_name) errors.product_name = "Product name is required";
    if (!formData.product_barcode) errors.product_barcode = "Barcode is required";
    if (!formData.unit_id) errors.unit_id = "Unit is required";
    if (!formData.category_id) errors.category_id = "Category is required";
    if (!formData.tag_id) errors.tag_id = "Tag is required";
    if (!formData.buying_price) errors.buying_price = "Buying price is required";
    if (!formData.selling_price) errors.selling_price = "Selling price is required";
    if (!formData.currency_id) errors.currency_id = "Currency is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
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
      supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
    };

    try {
      const isUpdate = initialData?.supplier_id;
      const url = isUpdate ? `/api/inventory/product/${initialData.supplier_id}` : '/api/inventory/product';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData?.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
        } else {
          setGeneralError(errorData?.message || errorData?.error || "Failed to save product");
        }
        return;
      }

      const newProduct = await res.json();
      onSubmit(newProduct)
      onCancel();
    } catch (error: any) {
      setGeneralError(error.message || "Unexpected error occurred");
    }
  };

  const handleAdd =(type: 'category' | 'tag' | 'supplier' | 'currency'| 'unit') =>{
    setOpenForm(type)
  };


  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData?.product_id ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent>
        <Card sx={{ width: '100%', mt: 2 }}>
      <CardContent>
        {generalError && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {generalError}
          </Typography>
        )}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Product Name"
              fullWidth
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
              error={!!fieldErrors.product_name}
              helperText={fieldErrors.product_name}
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
              error={!!fieldErrors.product_barcode}
              helperText={fieldErrors.product_barcode}
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
              error={!!fieldErrors.buying_price}
              helperText={fieldErrors.buying_price}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Selling Price"
              type="number"
              fullWidth
              value={formData.selling_price}
              onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
              error={!!fieldErrors.selling_price}
              helperText={fieldErrors.selling_price}
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
              <IconButton onClick={() => handleAdd('unit')}>
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
              <IconButton onClick={() => handleAdd('category')}>
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
              <IconButton onClick={() => handleAdd('tag')}>
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
                  <MenuItem key={cur.currency_id} value={cur.currency_id}>
                    {cur.currency_code} - {cur.currency_name}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton onClick={() => handleAdd('currency')}>
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
              <IconButton onClick={() => handleAdd('supplier')}>
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
              error={!!fieldErrors.product_max_quantity}
              helperText={fieldErrors.product_max_quantity}
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
              error={!!fieldErrors.product_min_quantity}
              helperText={fieldErrors.product_min_quantity}
            />
          </Grid>
        </Grid>
      </CardContent>
      <CategoryForm
        open={openForm === 'category'}
        onClose={() => setOpenForm(null)}
        onSuccess={(newCategory) => {
          const categoryOption = { id: newCategory.category_id, name: newCategory.category };
          setCategories(prev => [...prev, categoryOption]);
          setFormData(prev => ({ ...prev, category_id: categoryOption.id }));
          setOpenForm(null)
          toast.success('Category added successfully');
        }}
      />
      <TagForm
        open={openForm === 'tag'}
        onClose={() => setOpenForm(null)}
        onSuccess={(newTag) => {
          const tagOption = { id: newTag.tag_id, name: newTag.tag };
          setTags(prev => [...prev, tagOption]); 
          setFormData(prev => ({ ...prev, tag_id: tagOption.id}));
          setOpenForm(null)
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
        open={openForm === 'supplier'}
        onClose={() => setOpenForm(null)}
        onSuccess={(newSupplier) => {
           const supplierOption = { id: newSupplier.supplier_id, name: newSupplier.supplier_name };
            setSuppliers(prev => [...prev, supplierOption]);
            setFormData(prev => ({ ...prev, supplier_id: supplierOption.id})); // auto select
            setOpenForm(null);
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
                  
  </DialogContent>
  <DialogActions>
    <Button onClick={onCancel}>Cancel</Button>
    <Button type="submit" variant="contained">
    {initialData?.product_id ? 'Update' : 'Add'} Product
    </Button>
  </DialogActions>
  </form>
  </Dialog>
    
  );
}