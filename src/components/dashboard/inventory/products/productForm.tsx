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
  Autocomplete,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import { getUnits } from '@/server-actions/user-actions/inventory.actions';
import { toast } from 'react-toastify';
import SupplierForm from '../supplier/SupplierForm';
import CategoryForm from '../category/CategoryForm';
import TagForm from '../tag/tagForm';
import UnitForm from '../units/UnitForm';
import CurrencyForm from '../units/CurrencyForm';


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
    reorder_level: '',
    product_status: 1,
    supplier_id: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [units, setUnits] = useState<{ id: number, name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [tags, setTags] = useState<{ id: number, name: string }[]>([]);

  const [suppliers, setSuppliers] = useState<{ id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState<null | 'category' | 'tag' | 'supplier' | 'unit'>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        product_name: initialData?.product_name || '',
        product_barcode: initialData?.product_barcode?.toString() || '',
        product_description: initialData?.product_description || '',
        unit_id: initialData?.unit_id?.toString() || '',
        category_id: initialData?.category_id?.toString() || '',
        tag_id: initialData?.tag_id?.toString() || '',
        buying_price: initialData?.buying_price?.toString() || '',
        selling_price: initialData?.selling_price?.toString() || '',
        reorder_level: initialData?.reorder_level?.toString() || '',
        product_status: initialData?.product_status || 1,
        supplier_id: initialData?.supplier_id?.toString() || '',
      })

    } else {
      setFormData({
        product_name: '',
        product_barcode: '',
        product_description: '',
        unit_id: '',
        category_id: '',
        tag_id: '',
        buying_price: '',
        selling_price: '',
        reorder_level: '',
        product_status: 1,
        supplier_id: '',
      })
    }
    fetchData();
    setGeneralError(null);
  }, [initialData]);

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

      // Fetch units from database using server actions
      const unitsData = await getUnits();
      setUnits(unitsData);
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
      reorder_level: formData.reorder_level ? Number(formData.reorder_level) : null,
      supplier_id: formData.supplier_id && formData.supplier_id !== '' ? Number(formData.supplier_id) : null,
    };

    try {
      const isUpdate = initialData?.product_id;
      const url = isUpdate ? `/api/inventory/product/${initialData.product_id}` : '/api/inventory/product';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.log('API Error:', errorData); // Debug log
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

  const handleAdd = (type: 'category' | 'tag' | 'supplier' | 'unit') => {
    setOpenForm(type)
  };

  const calculateMarkup = () => {
    const buying = Number(formData.buying_price) || 0;
    const selling = Number(formData.selling_price) || 0;
    if (buying === 0) return 0;
    return Math.round(((selling - buying) / buying) * 100);
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
                  <TextField
                    label="Markup Percentage"
                    value={`${calculateMarkup()}%`}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="filled"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" alignItems="center">
                    <Autocomplete
                      fullWidth
                      options={units}
                      getOptionLabel={(option) => option.name}
                      value={units.find(unit => unit.id?.toString() === formData.unit_id) || null}
                      onChange={(_, newValue) => setFormData({ ...formData, unit_id: newValue?.id.toString() || '' })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Unit"
                          required
                          error={!!fieldErrors.unit_id}
                          helperText={fieldErrors.unit_id}
                        />
                      )}
                    />
                    <IconButton onClick={() => handleAdd('unit')}>
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" alignItems="center">
                    <Autocomplete
                      fullWidth
                      options={categories}
                      getOptionLabel={(option) => option.name}
                      value={categories.find(cat => cat.id?.toString() === formData.category_id) || null}
                      onChange={(_, newValue) => setFormData({ ...formData, category_id: newValue?.id.toString() || '' })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Category"
                          required
                          error={!!fieldErrors.category_id}
                          helperText={fieldErrors.category_id}
                        />
                      )}
                    />
                    <IconButton onClick={() => handleAdd('category')}>
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" alignItems="center">
                    <Autocomplete
                      fullWidth
                      options={tags}
                      getOptionLabel={(option) => option.name}
                      value={tags.find(tag => tag.id?.toString() === formData.tag_id) || null}
                      onChange={(_, newValue) => setFormData({ ...formData, tag_id: newValue?.id.toString() || '' })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tag"
                          required
                          error={!!fieldErrors.tag_id}
                          helperText={fieldErrors.tag_id}
                        />
                      )}
                    />
                    <IconButton onClick={() => handleAdd('tag')}>
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Grid>



                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" alignItems="center">
                    <Autocomplete
                      fullWidth
                      options={suppliers}
                      getOptionLabel={(option) => option.name}
                      value={suppliers.find(sup => sup.id?.toString() === formData.supplier_id) || null}
                      onChange={(_, newValue) => setFormData({ ...formData, supplier_id: newValue?.id.toString() || '' })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Supplier (Optional)"
                        />
                      )}
                    />
                    <IconButton onClick={() => handleAdd('supplier')}>
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Grid>


                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Reorder Level"
                    type="number"
                    fullWidth
                    value={formData.reorder_level}
                    onChange={(e) =>
                      setFormData({ ...formData, reorder_level: e.target.value })
                    }
                    error={!!fieldErrors.reorder_level}
                    helperText={fieldErrors.reorder_level}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CategoryForm
              open={openForm === 'category'}
              onClose={() => setOpenForm(null)}

              onSuccess={async (newCategory) => {
                const categoriesRes = await fetch('/api/inventory/category');
                const categoriesData = await categoriesRes.json();
                setCategories(categoriesData.map((cat: any) => ({ id: cat.category_id, name: cat.category })));
                setOpenForm(null);

                toast.success('Category added successfully');
              }}
            />
            <TagForm

          open={openForm === 'tag'}
          onClose={() => setOpenForm(null)}
          onSuccess={async (newTag) => {
            const tagsRes = await fetch('/api/inventory/tag');
            const tagsData = await tagsRes.json();
            setTags(tagsData.map((tag: any) => ({ id: tag.tag_id, name: tag.tag })));        
            setOpenForm(null);
            toast.success('Tag added successfully');
          }}
        />





            {/* Supplier Dialog  */}
            <SupplierForm
              open={openForm === 'supplier'}
              onClose={() => setOpenForm(null)}

              onSuccess={async (newSupplier) => {
                const suppliersRes = await fetch('/api/inventory/supplier');
                const suppliersData = await suppliersRes.json();
                setSuppliers(suppliersData.map((sup: any) => ({ id: sup.supplier_id, name: sup.supplier_name })));
                setOpenForm(null);
                toast.success('Supplier added successfully');
              }}
            />


            <UnitForm
              open={openForm === 'unit'}
              onClose={() => setOpenForm(null)}
              onSuccess={async () => {

                const unitsData = await getUnits();
                setUnits(unitsData);
                setOpenForm(null);

              }}
            />
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


