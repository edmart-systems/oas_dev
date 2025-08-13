"use client";

import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { useCurrency } from "@/components/currency/currency-context";
import { ProductSearchProps } from "@/modules/inventory/types/purchase.types";




export default function ProductSearch({
  searchTerm,
  products,
  recentSearches,
  showDropdown,
  selectedProductIndex,
  loading,
  onSearchChange,
  onKeyDown,
  onFocus,
  onBlur,
  onAddToCart,
  onCloseDropdown,
}: ProductSearchProps) {
  const { formatCurrency } = useCurrency();
  
  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };
const filteredProducts = products?.filter(product =>
  product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  product.product_barcode.toString().includes(searchTerm)
) || [];


  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        placeholder="Search products... (Use ↑↓ arrows and Enter)"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        slotProps={{
          input: {
            startAdornment: <MagnifyingGlass size={20} />,
          },
        }}
      />
      
      {(searchTerm || (showDropdown && recentSearches.length > 0)) && (
        <Box sx={{ 
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 3,
          maxHeight: 400,
          overflow: 'auto'
        }}>
          {!searchTerm && recentSearches.length > 0 ? (
            <Stack spacing={1} sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, py: 0.5 }}>
                Recent searches
              </Typography>
              
              {recentSearches.flatMap(search => 
                    (products || []).filter(product =>
                        product.product_name.toLowerCase().includes(search.toLowerCase()) ||
                        product.product_barcode.toString().includes(search)
                    ).slice(0, 2)
                    ).slice(0, 6).map((product, index) => (
                <Card 
                  key={`recent-${product.product_id}-${index}`}
                  variant="outlined"
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => {
                    onAddToCart(product);
                    onCloseDropdown();
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{xs:12, sm:4}}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {product.product_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Barcode: {product.product_barcode}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6, sm:2}}>
                        <Typography variant="body2" color="text.secondary">Stock</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {product.product_quantity}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6, sm:2}}>
                        <Typography variant="body2" color="text.secondary">Buy Price</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {safeCurrency(product.buying_price)}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6, sm:2}}>
                        <Typography variant="body2" color="text.secondary">Sell Price</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {safeCurrency(product.selling_price)}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6, sm:2}} sx={{ textAlign: 'right' }}>
                        <Plus size={20} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : loading ? (
            <Typography sx={{ p: 2 }}>Loading...</Typography>
          ) : filteredProducts.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>No products found</Typography>
          ) : (
            <Stack spacing={1} sx={{ p: 1 }}>
              {filteredProducts.slice(0, 10).map((product, index) => (
                <Card 
                  key={product.product_id} 
                  variant="outlined"
                  sx={{ 
                    bgcolor: selectedProductIndex === index ? 'action.selected' : 'inherit',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    onAddToCart(product);
                    onCloseDropdown();
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{xs:12, sm:4}}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {product.product_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Barcode: {product.product_barcode}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6, sm:2}}>
                        <Typography variant="body2" color="text.secondary">Stock</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {product.product_quantity}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6, sm:2}}>
                        <Typography variant="body2" color="text.secondary">Buy Price</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {safeCurrency(product.buying_price)}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6, sm:2}}>
                        <Typography variant="body2" color="text.secondary">Sell Price</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {safeCurrency(product.selling_price)}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6, sm:2}} sx={{ textAlign: 'right' }}>
                        <Plus size={20} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}
