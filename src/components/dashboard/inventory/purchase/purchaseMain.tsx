"use client";

import {
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Box,
  Typography,
  alpha,
  useTheme,
  CircularProgress,
  Autocomplete,
  TextField,
  Chip
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { Add, Store, Clear, Receipt } from "@mui/icons-material";
import ProductSearch from "./purchaseSearch";
import PurchaseCart from "./purchaseCart";
import { CartItem } from "@/modules/inventory/types/purchase.types";
import { Product } from "@/types/product.types";
import { Supplier } from "@/modules/inventory/types/supplier.types";
import { toast } from "react-toastify";
import SupplierForm from "../supplier/SupplierForm";
import ProductForm from "../products/productForm";
import { useEffect, useState } from "react";

interface PurchaseMainProps {
  products?: Product[];
  suppliers?: Supplier[];
  onProcessPurchase?: (data: any) => Promise<boolean>;
  onDataRefresh?: () => Promise<void>;
  loading?: boolean;
}




export default function PurchaseMain({ 
  products = [], 
  suppliers = [], 
  onProcessPurchase, 
  onDataRefresh,
  loading = false 
}: PurchaseMainProps) {
  const theme = useTheme();
  const colors = {
    primary: "#D98219",
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : "#ffffff",
    border: theme.palette.divider,
  };

  const [processing, setProcessing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [supplierId, setSupplierId] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [openForm, setOpenForm] = useState<null | 'product' | 'supplier'>(null);

  // Set default supplier if available
  useEffect(() => {
    if (suppliers.length > 0 && !selectedSupplier) {
      const firstSupplier = suppliers[0];
      setSelectedSupplier(firstSupplier);
      setSupplierId(firstSupplier.supplier_id?.toString() || firstSupplier.id?.toString() || '');
    }
  }, [suppliers, selectedSupplier]);

  const addToCart = (product: Product) => {
    console.log('addToCart called with product:', product);
    console.log('Current cart:', cart);
    
    if (!product || !product.product_id) {
      console.error('Invalid product:', product);
      toast.error("Invalid product selected");
      return;
    }

    const existingItem = cart.find(item => item.product_id === product.product_id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      const updatedCart = cart.map(item => 
        item.product_id === product.product_id 
          ? { ...item, quantity: newQuantity, total_cost: item.unit_cost * newQuantity }
          : item
      );
      console.log('Updating existing item, new cart:', updatedCart);
      setCart(updatedCart);
      toast.success(`Updated ${product.product_name} quantity to ${newQuantity}`);
    } else {
      const unitCost = product.buying_price || 0;
      const cartItem: CartItem = {
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: 1,
        unit_cost: unitCost,
        total_cost: unitCost
      };
      const newCart = [cartItem, ...cart];
      console.log('Adding new item, new cart:', newCart);
      setCart(newCart);
      toast.success(`Added ${product.product_name} to cart`);
    }
  };

  const updateQuantity = (product_id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(product_id);
      return;
    }
    setCart(cart.map(item => 
      item.product_id === product_id 
        ? { ...item, quantity, total_cost: item.unit_cost * quantity }
        : item
    ));
  };

  const updateUnitCost = (product_id: number, unit_cost: number) => {
    if (unit_cost < 0) return;
    setCart(cart.map(item => 
      item.product_id === product_id 
        ? { ...item, unit_cost, total_cost: unit_cost * item.quantity }
        : item
    ));
  };

  const removeFromCart = (product_id: number) => {
    setCart(cart.filter(item => item.product_id !== product_id));
  };

  const clearCart = () => setCart([]);

const processPurchase = async (action: 'save' | 'saveNew' | 'saveClose') => {
  if (!supplierId || cart.length === 0) {
    toast.error("Please select supplier and add products");
    return;
  }

  // Validate cart items
  const invalidItems = cart.filter(item => item.quantity <= 0 || item.unit_cost <= 0);
  if (invalidItems.length > 0) {
    toast.error("Please ensure all items have valid quantity and unit cost");
    return;
  }

  setProcessing(true);
  
  try {
    const success = await onProcessPurchase?.({
      supplierId: parseInt(supplierId),
      items: cart
    });
    
    if (success) {
      if (action === 'saveNew') {
        clearCart();
        // Reset supplier selection to first available
        if (suppliers.length > 0) {
          const firstSupplier = suppliers[0];
          setSelectedSupplier(firstSupplier);
          setSupplierId(firstSupplier.supplier_id?.toString() || firstSupplier.id?.toString() || '');
        }
      } else if (action === 'saveClose') {
        window.location.href = '/dashboard';
        return;
      }
      // For 'save' action, keep current state
      await onDataRefresh?.();
    }
  } catch (error) {
    console.error('Purchase processing failed:', error);
    toast.error('Failed to process purchase. Please try again.');
  } finally {
    setProcessing(false);
  }
};


  const handleAddForm = (type: 'product' | 'supplier') => {
    setOpenForm(type);
  };

  return (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
      border: `1px solid ${alpha(colors.border, 0.1)}`,
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }} color={colors.primary}>
            Purchase Details
          </Typography>
            {/* <Typography variant="h4" fontWeight={700} gutterBottom color={colors.primary}>
              Purchase
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create a new purchase for your inventory
            </Typography> */}
          </Box>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleAddForm('product')}
            disabled={loading}
            sx={{
              borderRadius: 2,
              borderColor: colors.primary,
              color: colors.primary,
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: alpha(colors.primary, 0.05),
              }
            }}
          >
            Add Product
          </Button>
        </Box>

        {/* Supplier Selection and Product Search */}
        <Box sx={{ mb: 4 }}>
          
          <Grid container spacing={3} alignItems="center">
             <Grid size={{ xs: 12, md: 8 }}>
             
              <ProductSearch
                products={products}
                onAddToCart={addToCart}
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={2}>
                <Autocomplete
                  fullWidth
                  size="small"
                  options={suppliers}
                  value={selectedSupplier}
                  onChange={(_, newValue) => {
                    setSelectedSupplier(newValue);
                    setSupplierId(newValue ? (newValue.supplier_id?.toString() || newValue.id?.toString() || '') : '');
                  }}
                  getOptionLabel={(option) => option.supplier_name || option.name || ''}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Supplier"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: alpha(colors.border, 0.3),
                          },
                          '&:hover fieldset': {
                            borderColor: colors.primary,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: colors.primary,
                          }
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store sx={{ fontSize: 16, color: colors.primary }} />
                      {option.supplier_name || option.name}
                    </Box>
                  )}
                />
                <IconButton 
                  onClick={() => handleAddForm('supplier')}
                  sx={{
                    backgroundColor: alpha(colors.primary, 0.1),
                    color: colors.primary,
                    '&:hover': {
                      backgroundColor: alpha(colors.primary, 0.2),
                    }
                  }}
                >
                  <Add />
                </IconButton>
              </Stack>
            </Grid>
           
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Purchase Cart */}
        <PurchaseCart
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onUpdateUnitCost={updateUnitCost}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          loading={processing}
        />
        
        {/* Action Buttons */}
        {cart.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Purchase Items:
              </Typography>
              <Chip 
                label={cart?.length || 0} 
                size="small" 
                sx={{ 
                  backgroundColor: alpha(colors.primary, 0.2),
                  color: colors.primary,
                  fontWeight: 600
                }} 
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
           <Button
              variant="outlined"
              onClick={() => processPurchase('saveClose')}
              disabled={processing || !supplierId}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 2,
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.1),
                  borderColor: colors.primary,
                },
                '&:disabled': {
                  borderColor: alpha(colors.primary, 0.5),
                  color: alpha(colors.primary, 0.5),
                }
              }}
            >
              Save & Close
            </Button>
            <Button
              variant="contained"
              onClick={() => processPurchase('saveNew')}
              disabled={processing || !supplierId}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 2,
                backgroundColor: colors.primary,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.9),
                },
                '&:disabled': {
                  backgroundColor: alpha(colors.primary, 0.5),
                }
              }}
            >
              Save & New
            </Button>
             <Button 
              variant="outlined"
              onClick={clearCart}
              sx={{ 
                borderRadius: 2,
                py: 1,
                px: 3,
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.1),
                  borderColor: colors.primary,
                }
              }}
            >
              Clear
            </Button>
            </Box>
          </Box>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress sx={{ color: colors.primary }} />
          </Box>
        )}
      </CardContent>

      {/* Supplier Form */}
      <SupplierForm
        open={openForm === 'supplier'}
        onClose={() => setOpenForm(null)}
        onSuccess={async (newSupplier) => {
          setOpenForm(null);
          toast.success("Supplier Added Successfully");
          await onDataRefresh?.(); // Refresh data to include new supplier
        }}
      />

      {/* Product Form */}
      <ProductForm
        open={openForm === 'product'}
        onCancel={() => setOpenForm(null)}
        onSubmit={async (newProduct) => {
          setOpenForm(null);
          toast.success("Product added successfully");
          await onDataRefresh?.(); // Refresh data to include new product
        }}
        initialData={null}
      />
    </Card>
  );
}