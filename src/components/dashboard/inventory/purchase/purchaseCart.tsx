"use client";

import {
  Button,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Trash, Receipt } from "@phosphor-icons/react";
import { useCurrency } from "@/components/currency/currency-context";
import { CartItem } from "@/modules/inventory/types/purchase.types";

interface Props{
  cart: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onUpdateUnitCost: (productId: number, unitCost: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onProcessPurchase: () => void;
  loading: boolean;
}



export default function PurchaseCart({
  cart,
  onUpdateQuantity,
  onUpdateUnitCost,
  onRemoveItem,
  onClearCart,
  onProcessPurchase,
  loading
}: Props) {
  const { formatCurrency } = useCurrency();
  
  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

 
  const getSubtotal = () => (cart || []).reduce((sum, item) => sum + item.total_cost, 0);
  const getTotal = () => getSubtotal();

if (!cart || cart.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
        Search and add products to your purchase cart
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Purchase Cart ({cart?.length})</Typography>
        <Button size="small" onClick={onClearCart} color="error">
          Clear Cart
        </Button>
      </Stack>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="center">Unit Cost</TableCell>
              <TableCell align="center">Total</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(cart || []).map((item) => (
              <TableRow key={item.product_id}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    inputMode="numeric"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        const qty = parseInt(value) || 1;
                        onUpdateQuantity(item.product_id, qty < 1 ? 1 : qty);
                      }
                    }}
                    sx={{ width: 70 }}
                    slotProps={{ input: { style: { textAlign: 'center' } } }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    inputMode="decimal"
                    value={item.unit_cost}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        onUpdateUnitCost(item.product_id, parseFloat(value) || 0);
                      }
                    }}
                    sx={{ width: 90 }}
                    slotProps={{ input: { style: { textAlign: 'center' } } }}
                  />
                </TableCell>
                <TableCell align="center">{safeCurrency(item.total_cost)}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="error" onClick={() => onRemoveItem(item.product_id)}>
                    <Trash size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Stack direction="row" justifyContent="flex-end">
        <Stack spacing={1} sx={{ minWidth: 200 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6" color="primary">
              {safeCurrency(getTotal())}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<Receipt />}
            onClick={onProcessPurchase}
            disabled={loading}
          >
            Create Purchase
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
