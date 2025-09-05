'use client';

import {
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Autocomplete,
  Box,
  Divider,
  Chip,
  InputAdornment,
  Fade,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BusinessIcon from '@mui/icons-material/Business';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useState, useEffect } from 'react';
import { getUnits } from '@/server-actions/user-actions/inventory.actions';
import { toast } from 'react-toastify';
import SupplierForm from '../supplier/SupplierForm';
import CategoryForm from '../category/CategoryForm';
import TagForm from '../tag/tagForm';
import UnitForm from '../units/UnitForm';


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
    markup: '',
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

const muiTheme = useTheme(); // MUI colors object

  // Color palette that adapts to light/dark mode
  const colors = {
    primary: "#D98219",
    secondary: muiTheme.palette.info.main,
    success: muiTheme.palette.success.main,
    warning: muiTheme.palette.primary.main,
    error: muiTheme.palette.error.main,
    background:
      muiTheme.palette.mode === "dark"
        ? muiTheme.palette.background.default
        : "#fafafa",
    surface: muiTheme.palette.background.paper,
    surfaceVariant:
      muiTheme.palette.mode === "dark"
        ? alpha(muiTheme.palette.grey[800], 0.7)
        : "#f5f5f5",
  };
  const calcMarkupFromPrices = (buying: number, selling: number) => {
  if (!buying || buying === 0) return '';
  return (((selling - buying) / buying) * 100).toFixed(2);
};

  useEffect(() => {
    if (initialData) {
      const buying = Number(initialData?.buying_price || 0);
      const selling = Number(initialData?.selling_price || 0);
      setFormData({
        product_name: initialData?.product_name || '',
        product_barcode: initialData?.product_barcode?.toString() || '',
        product_description: initialData?.product_description || '',
        unit_id: initialData?.unit_id?.toString() || '',
        category_id: initialData?.category_id?.toString() || '',
        tag_id: initialData?.tag_id?.toString() || '',
       buying_price: buying ? buying.toString() : '',
      selling_price: selling ? selling.toString() : '',
      markup: calcMarkupFromPrices(buying, selling),
        reorder_level: initialData?.reorder_level?.toString() || '',
        product_status: initialData?.product_status || 1,
        supplier_id: initialData?.supplier_id?.toString() || '',
      });
    } else {
      setFormData({
        product_name: '',
        product_barcode: '',
        product_description: '',
        unit_id: '',
        category_id: '',
        tag_id: '',
        buying_price: '',
         markup: '',
        selling_price: '',
        reorder_level: '',
        product_status: 1,
        supplier_id: '',
      });
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

      const unitsData = await getUnits();
      setUnits(unitsData);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };

  const handleBuyingPriceChange = (value: string) => {
  const buying = Number(value) || 0;
  const markup = Number(formData.markup) || 0;

  let selling = formData.selling_price;
  if (markup && buying) {
    selling = (buying * (1 + markup / 100)).toFixed(2);
  }
  setFormData({
    ...formData,
    buying_price: value,
    selling_price: selling,
    markup: calcMarkupFromPrices(buying, Number(selling))
  });
};

const handleSellingPriceChange = (value: string) => {
  const selling = Number(value) || 0;
  const buying = Number(formData.buying_price) || 0;

  let markup = formData.markup;
  if (buying) {
    markup = calcMarkupFromPrices(buying, selling);
  }
  setFormData({
    ...formData,
    selling_price: value,
    markup,
  });
};

const handleMarkupChange = (value: string) => {
  const markup = Number(value) || 0;
  const buying = Number(formData.buying_price) || 0;
  let selling = formData.selling_price;

  if (buying && markup) {
    selling = (buying * (1 + markup / 100)).toFixed(2);
  } else if (!buying && selling) {
    // If selling exists but buying doesn't, derive buying from selling
    const s = Number(selling);
    const b = markup ? (s / (1 + markup / 100)).toFixed(2) : '';
    setFormData({
      ...formData,
      buying_price: b.toString(),
      markup: value,
    });
    return;
  }
  setFormData({
    ...formData,
    markup: value,
    selling_price: selling
  });
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
        if (errorData?.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
        } else {
          setGeneralError(errorData?.message || errorData?.error || "Failed to save product");
        }
        return;
      }

      const newProduct = await res.json();
      onSubmit(newProduct);
      onCancel();
    } catch (error: any) {
      setGeneralError(error.message || "Unexpected error occurred");
    }
  };

  const handleAdd = (type: 'category' | 'tag' | 'supplier' | 'unit') => {
    setOpenForm(type);
  };

  const calculateMarkup = () => {
    const buying = Number(formData.buying_price) || 0;
    const selling = Number(formData.selling_price) || 0;
    if (buying === 0) return 0;
    return Math.round(((selling - buying) / buying) * 100);
  };

  const getMarkupColor = () => {
    const markup = calculateMarkup();
    if (markup < 10) return colors.error;
    if (markup < 30) return colors.primary;
    return colors.success;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onCancel} 
      maxWidth="lg" 
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14)',
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
            color: 'White',
            textAlign: 'center',
            py: 3,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <InventoryIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="div" fontWeight="600">
              {initialData?.product_id ? 'Edit Product' : 'Add New Product'}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: colors.background }}>
          {generalError && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                m: 3, 
                backgroundColor: colors.error + '10',
                border: `1px solid ${colors.error}40`,
                borderRadius: 2
              }}
            >
              <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
                {generalError}
              </Typography>
            </Paper>
          )}

          <Box sx={{ p: 3 }}>
            {/* Basic Information Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <DescriptionIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Basic Information
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    label="Product Name"
                    fullWidth
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                    error={!!fieldErrors.product_name}
                    helperText={fieldErrors.product_name}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: colors.primary },
                      }
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Barcode"
                    type="number"
                    fullWidth
                    value={formData.product_barcode}
                    onChange={(e) => setFormData({ ...formData, product_barcode: e.target.value })}
                    required
                    error={!!fieldErrors.product_barcode}
                    helperText={fieldErrors.product_barcode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <QrCodeIcon sx={{ color: colors.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: colors.primary },
                      }
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    label="Description"
                    multiline
                    rows={3}
                    fullWidth
                    value={formData.product_description}
                    onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: colors.primary },
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Pricing Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <AttachMoneyIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Pricing Information
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Buying Price"
                    type="number"
                    fullWidth
                    value={formData.buying_price}
                    onChange={(e) => handleBuyingPriceChange(e.target.value)}
                    error={!!fieldErrors.buying_price}
                    helperText={fieldErrors.buying_price}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"></InputAdornment>,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: colors.primary },
                      }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Selling Price"
                    type="number"
                    fullWidth
                    value={formData.selling_price}
                    onChange={(e) => handleSellingPriceChange(e.target.value)}
                    error={!!fieldErrors.selling_price}
                    helperText={fieldErrors.selling_price}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"></InputAdornment>,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: colors.primary },
                      }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                label="Markup Percentage"
                type="number"
                fullWidth
                value={formData.markup}
                onChange={(e) => handleMarkupChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BarChartIcon sx={{ color: getMarkupColor() }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: getMarkupColor() },
                  }
                }}
                                />
                  <Chip
                    label={Number(formData.markup) > 20 ? "Good Margin" : Number(formData.markup) > 0 ? "Low Margin" : "No Profit"}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: 8,
                      backgroundColor: getMarkupColor(),
                      color: 'white',
                      fontSize: '0.75rem',
                    }}
                  />

                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Categories & Classification Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <CategoryIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Categories & Classification
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: colors.primary },
                            }
                          }}
                        />
                      )}
                    />
                    <IconButton 
                      onClick={() => handleAdd('unit')}
                      sx={{ 
                        bgcolor: colors.primary + '10',
                        '&:hover': { bgcolor: colors.primary + '20' }
                      }}
                    >
                      <AddIcon sx={{ color: colors.primary }} />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: colors.primary },
                            }
                          }}
                        />
                      )}
                    />
                    <IconButton 
                      onClick={() => handleAdd('category')}
                      sx={{ 
                        bgcolor: colors.primary + '10',
                        '&:hover': { bgcolor: colors.primary + '20' }
                      }}
                    >
                      <AddIcon sx={{ color: colors.primary }} />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
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
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocalOfferIcon sx={{ color: colors.primary }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: colors.primary },
                            }
                          }}
                        />
                      )}
                    />
                    <IconButton 
                      onClick={() => handleAdd('tag')}
                      sx={{ 
                        bgcolor: colors.primary + '10',
                        '&:hover': { bgcolor: colors.primary + '20' }
                      }}
                    >
                      <AddIcon sx={{ color: colors.primary }} />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
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
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <BusinessIcon sx={{ color: colors.primary }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: colors.primary },
                            }
                          }}
                        />
                      )}
                    />
                    <IconButton 
                      onClick={() => handleAdd('supplier')}
                      sx={{ 
                        bgcolor: colors.primary + '10',
                        '&:hover': { bgcolor: colors.primary + '20' }
                      }}
                    >
                      <AddIcon sx={{ color: colors.primary }} />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Inventory Management Section */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <InventoryIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="600" color={colors.primary}>
                  Inventory Management
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Reorder Level"
                    type="number"
                    fullWidth
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    error={!!fieldErrors.reorder_level}
                    helperText={fieldErrors.reorder_level || "Set minimum stock level for alerts"}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: colors.primary },
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Dialog Forms */}
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
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={onCancel}
            variant="outlined"
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              borderColor: colors.primary + '40',
              color: colors.primary,
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: colors.primary + '05'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
              boxShadow: `0 4px 12px ${colors.primary}40`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.primary}dd 0%, ${colors.primary}bb 100%)`,
                boxShadow: `0 6px 16px ${colors.primary}50`,
              }
            }}
          >
            {initialData?.product_id ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}