"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Trash } from "@phosphor-icons/react";
import SupplierForm from "@/components/dashboard/inventory/supplier/SupplierForm";
import ProductForm from "@/components/dashboard/inventory/products/productForm";
import { saveOrUpdate } from "@/components/dashboard/inventory/form-handlers";
import { useCurrency } from "@/components/currency/currency-context";
import { PurchaseDialogsProps } from "@/modules/inventory/types/purchase.types";

export default function PurchaseDialogs({
  openDialog,
  itemToDelete,
  onCloseDialog,
  onConfirmDelete,
  onRefreshData,
}: PurchaseDialogsProps) {
  const { formatCurrency } = useCurrency();
  
  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

  return (
    <>
      {/* Add Supplier Dialog */}
      <SupplierForm
        open={openDialog.supplier}
        onClose={() => onCloseDialog('supplier')}
        onSuccess={() => {
          onRefreshData();
        }}
      />
      
      {/* Add Inventory Point Dialog */}
      <Dialog open={openDialog.inventoryPoint} onClose={() => onCloseDialog('inventoryPoint')}>
        <DialogTitle>Add New Inventory Point</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField label="Inventory Point Name" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onCloseDialog('inventoryPoint')}>Cancel</Button>
          <Button variant="contained">Add Inventory Point</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Product Dialog */}
      <Dialog open={openDialog.product} onClose={() => onCloseDialog('product')} maxWidth="md" fullWidth>
        <DialogContent>
          <ProductForm
            onSubmit={async (data) => {
              await saveOrUpdate({
                endpoint: '/api/inventory/product',
                data,
                onSuccess: () => {
                  onRefreshData();
                  onCloseDialog('product');
                }
              });
            }}
            onCancel={() => onCloseDialog('product')}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog.deleteConfirm} onClose={() => onCloseDialog('deleteConfirm')}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Trash size={24} color="#f44336" />
          Remove Item
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>"{itemToDelete?.product_name}"</strong> from your cart?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Quantity: {itemToDelete?.quantity} | Total: {itemToDelete && safeCurrency(itemToDelete.total_cost)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onCloseDialog('deleteConfirm')}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={onConfirmDelete}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
