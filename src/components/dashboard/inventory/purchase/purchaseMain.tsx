"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { Plus } from "@phosphor-icons/react";
import ProductSearch from "./purchaseSearch";
import { PurchaseMainProps } from "@/modules/inventory/types";
import PurchaseCart from "./purchaseCart";


export default function PurchaseMain({
  products,
  cart,
  suppliers,
  inventoryPoints,
  supplierId,
  inventoryPointId,
  searchTerm,
  recentSearches,
  showDropdown,
  selectedProductIndex,
  loading,
  onSupplierChange,
  onInventoryPointChange,
  onSearchChange,
  onKeyDown,
  onSearchFocus,
  onSearchBlur,
  onAddToCart,
  onCloseDropdown,
  onUpdateQuantity,
  onUpdateUnitCost,
  onRemoveItem,
  onClearCart,
  onProcessPurchase,
  onOpenDialog,
}: PurchaseMainProps) {

  return (
    <Card>
      <CardHeader
        title="Purchase Order"
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={() => onOpenDialog('product')}
          >
            Add New Product
          </Button>
        }
      />
      <CardContent>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{xs:12, md:6}}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={supplierId}
                  onChange={(e) => onSupplierChange(Number(e.target.value))}
                  label="Supplier"
                >
                 {suppliers?.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                </MenuItem>
                )) || []}

                </Select>
              </FormControl>
              <IconButton onClick={() => onOpenDialog('supplier')}>
                <Plus size={20} />
              </IconButton>
            </Stack>
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Inventory Point</InputLabel>
                <Select
                  value={inventoryPointId}
                  onChange={(e) => onInventoryPointChange(Number(e.target.value))}
                  label="Inventory Point"
                >
                 {inventoryPoints?.map((point) => (
                    <MenuItem key={point.id} value={point.id}>
                        {point.name}
                    </MenuItem>
                    )) || []}

                </Select>
              </FormControl>
              <IconButton onClick={() => onOpenDialog('inventoryPoint')}>
                <Plus size={20} />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
        
        <ProductSearch
          searchTerm={searchTerm}
          products={products}
          recentSearches={recentSearches}
          showDropdown={showDropdown}
          selectedProductIndex={selectedProductIndex}
          loading={loading}
          onSearchChange={onSearchChange}
          onKeyDown={onKeyDown}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          onAddToCart={onAddToCart}
          onCloseDropdown={onCloseDropdown}
        />
        
        <Divider sx={{ my: 3 }} />
        
        <PurchaseCart
          cart={cart}
          onUpdateQuantity={onUpdateQuantity}
          onUpdateUnitCost={onUpdateUnitCost}
          onRemoveItem={onRemoveItem}
          onClearCart={onClearCart}
          onProcessPurchase={onProcessPurchase}
        />
      </CardContent>
    </Card>
  );
}
