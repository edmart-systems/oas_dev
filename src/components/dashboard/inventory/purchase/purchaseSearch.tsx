"use client";

import {
  alpha,
  Box,
  Card,
  CardContent,
  Fade,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  Avatar,
  IconButton,
  CircularProgress
} from "@mui/material";

import { Grid as GridItem } from "@mui/material";
import { Search, Add, ShoppingCart as Package } from "@mui/icons-material";
import { Product } from "@/types/product.types";
import { useEffect, useRef, useState } from "react";
import { useCurrency } from "@/components/currency/currency-context";

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
  loading?: boolean;
}

// Product Card Component
function ProductCard({ product, onClick, onMouseEnter, colors, theme, isSelected }: any) {
  const { formatCurrency } = useCurrency();
    
    const safeCurrency = (amount: number) => {
      if (typeof amount !== 'number' || isNaN(amount)) return formatCurrency(0);
      return formatCurrency(amount);
    };

  return (
    <Card
      sx={{
        cursor: "pointer",
        borderRadius: 2,
        backgroundColor: isSelected 
          ? alpha(colors.primary, 0.1)
          : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: alpha(colors.primary, 0.08),
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.1)}`,
        }
      }}
      onClick={() => onClick(product)}
      onMouseEnter={onMouseEnter}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              backgroundColor:"#ffffff",
              color: colors.primary 
            }}
          >
            <Package />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {product.product_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Barcode: {product.product_barcode || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 60 }}>
            <Typography variant="caption" color="text.secondary">
              Stock
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {product.stock_quantity || 0}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 80 }}>
            <Typography variant="caption" color="text.secondary">
              Buy Price
            </Typography>
            <Typography variant="body2" fontWeight={500} color={colors.primary}>
              {safeCurrency(product.buying_price || 0)}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Add button clicked for product:', product.product_name);
              onClick(product);
            }}
            sx={{
              backgroundColor: alpha(colors.primary, 0.1),
              color: colors.primary,
              '&:hover': {
                backgroundColor: alpha(colors.primary, 0.2),
              }
            }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ProductSearch({ products, onAddToCart, loading = false }: Props) {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  
  const safeCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) return formatCurrency(0);
    return formatCurrency(amount);
  };
  
  const colors = {
    primary: "#D98219",
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : "#ffffff",
    border: theme.palette.divider,
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLElement | null>(null);

  const filteredProducts = products?.filter(
    (p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_barcode.toString().includes(searchTerm)
  ) || [];

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setShowDropdown(false);
      }
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showDropdown || filteredProducts.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedProductIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedProductIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProducts.length - 1
      );
    } else if (e.key === "Enter" && selectedProductIndex >= 0) {
      e.preventDefault();
      handleProductClick(filteredProducts[selectedProductIndex]);
    }
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
    console.log('onAddToCart function:', onAddToCart);
    
    if (!onAddToCart) {
      console.error('onAddToCart function is not provided');
      return;
    }
    
    try {
      onAddToCart(product);
      setRecentSearches((prev) => {
        const term = searchTerm.trim();
        if (!term) return prev;
        const updated = [term, ...prev.filter((s) => s !== term)];
        return updated.slice(0, 6);
      });
      setSearchTerm("");
      setShowDropdown(false);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <Box sx={{ position: "relative" }} ref={dropdownRef}>
      <TextField
        fullWidth
        placeholder="Search products by name or barcode... (Use ↑↓ arrows and Enter)"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowDropdown(true);
          setSelectedProductIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            backgroundColor: alpha(colors.surfaceVariant, 0.5),
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: alpha(colors.surfaceVariant, 0.8),
            },
            '&.Mui-focused': {
              backgroundColor: colors.surface,
              boxShadow: `0 0 0 2px ${alpha(colors.primary, 0.2)}`,
            }
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <Search sx={{ mr: 1, color: alpha(theme.palette.text.primary, 0.6) }} />
            ),
            endAdornment: loading && <CircularProgress size={20} />,
          },
        }}
      />

      {showDropdown && (
        <Fade in={showDropdown}>
          <Paper
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1000,
              mt: 1,
              borderRadius: 3,
              boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
              backdropFilter: 'blur(20px)',
              backgroundColor: alpha(colors.surface, 0.95),
              border: `1px solid ${alpha(colors.border, 0.1)}`,
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            {searchTerm.trim() === "" ? (
              <Stack spacing={1} sx={{ p: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1, py: 0.5 }}>
                  All Products
                </Typography>
                {products.slice(0, 10).map((product, index) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onClick={handleProductClick}
                    formatCurrency={safeCurrency}
                    colors={colors}
                    theme={theme}
                    isSelected={false}
                  />
                ))}
              </Stack>
            ) : loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ color: colors.primary }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Loading products...
                </Typography>
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Package sx={{ fontSize: 48, color: alpha(theme.palette.text.primary, 0.3), mb: 1 }} />
                <Typography color="text.secondary">
                  No products found
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1} sx={{ p: 1 }}>
                {filteredProducts.slice(0, 10).map((product, index) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onClick={handleProductClick}
                    onMouseEnter={() => setSelectedProductIndex(index)}
                    formatCurrency={safeCurrency}
                    colors={colors}
                    theme={theme}
                    isSelected={selectedProductIndex === index}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Fade>
      )}
    </Box>
  );
}
