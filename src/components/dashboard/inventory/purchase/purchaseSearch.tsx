"use client";

import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { MagnifyingGlass, Plus, PlusIcon } from "@phosphor-icons/react";
import { useCurrency } from "@/components/currency/currency-context";
import { Product } from "@/types/product.types";
import { useEffect, useRef, useState } from "react";

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductSearch({ products, onAddToCart }: Props) {
  const { formatCurrency } = useCurrency();

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

  const onSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(true);
    setSelectedProductIndex(-1);
  };

  const onCloseDropdown = () => {
    setShowDropdown(false);
    setSelectedProductIndex(-1);
  };

  const onFocus = () => {
    // Always show dropdown if recent searches exist
    if (recentSearches.length > 0 || searchTerm.trim() !== "") {
      setShowDropdown(true);
    }
  };

  const onBlur = () => {
    // delay close to allow click events to register
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        onCloseDropdown();
      }
    }, 250);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const filteredProducts = getFilteredProducts();
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
    onAddToCart(product);
    setRecentSearches((prev) => {
      const term = searchTerm.trim();
      if (!term) return prev; // don't add empty terms
      const updated = [term, ...prev.filter((s) => s !== term)];
      return updated.slice(0, 6);
    });
    setSearchTerm("");
    onCloseDropdown();
  };

  const getFilteredProducts = () =>
    products?.filter(
      (p) =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_barcode.toString().includes(searchTerm)
    ) || [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onCloseDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = getFilteredProducts();

  return (
    <Box sx={{ position: "relative" }} ref={dropdownRef}>
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

      {showDropdown && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: 3,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          {searchTerm.trim() === "" && recentSearches.length > 0 ? (
            // Show recent searches when input is empty
            <Stack spacing={1} sx={{ p: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 1, py: 0.5 }}
              >
                Recent searches
              </Typography>
              {recentSearches
                .flatMap((search) =>
                  products
                    .filter(
                      (p) =>
                        p.product_name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        p.product_barcode.toString().includes(search)
                    )
                    .slice(0, 2)
                )
                .slice(0, 6)
                .map((product, index) => (
                  <Card
                    key={`recent-${product.product_id}-${index}`}
                    variant="outlined"
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    onClick={() => handleProductClick(product)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {product.product_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Barcode: {product.product_barcode}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Stock
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {product.product_quantity}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Buy Price
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {safeCurrency(product.buying_price)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Sell Price
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {safeCurrency(product.selling_price)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }} sx={{ textAlign: "right" }}>
                          <PlusIcon size={20} onClick={(e) => {
                              e.stopPropagation(); // prevent Card click / blur issue
                              handleProductClick(product);
                            }}
                            style={{ cursor: "pointer" }} />
                        </Grid>

                      </Grid>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          ) : loading ? (
            <Typography sx={{ p: 2 }}>Loading...</Typography>
          ) : filteredProducts.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              No products found
            </Typography>
          ) : (
            // Show normal search results
            <Stack spacing={1} sx={{ p: 1 }}>
              {filteredProducts.slice(0, 10).map((product, index) => (
                <Card
                  key={product.product_id}
                  variant="outlined"
                  sx={{
                    bgcolor:
                      selectedProductIndex === index
                        ? "action.selected"
                        : "inherit",
                    cursor: "pointer",
                  }}
                  onClick={() => handleProductClick(product)}
                  onMouseEnter={() => setSelectedProductIndex(index)}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {product.product_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Barcode: {product.product_barcode}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Stock
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {product.product_quantity}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Buy Price
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {safeCurrency(product.buying_price)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Sell Price
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {safeCurrency(product.selling_price)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }} sx={{ textAlign: "right" }}>
                        <PlusIcon
                          size={20}
                          onClick={(e) => {
                            e.stopPropagation(); // prevent parent Card click from firing twice
                            handleProductClick(product);
                          }}
                          style={{ cursor: "pointer" }}
                        />
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
