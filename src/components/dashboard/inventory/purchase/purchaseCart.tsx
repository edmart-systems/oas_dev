

import React from "react";
import {
  Button,
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
  Box,
  Card,
  CardContent,
  Paper,
  Chip,
  Avatar,
  Tooltip,
  alpha,
  useTheme
} from "@mui/material";
import { Delete, Receipt, ShoppingCart, Inventory, Clear } from "@mui/icons-material";
import { CartItem } from "@/modules/inventory/types/purchase.types";
import { useCurrency } from "@/components/currency/currency-context";


interface Props{
  cart: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onUpdateUnitCost: (productId: number, unitCost: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  loading: boolean;
}



export default function PurchaseCart({
  cart,
  onUpdateQuantity,
  onUpdateUnitCost,
  onRemoveItem,
  onClearCart,
  loading
}: Props) {
  const theme = useTheme();
  const colors = {
    primary: "#D98219",
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : "#ffffff",
    border: theme.palette.divider,
  };

  const { formatCurrency } = useCurrency();
  
  const safeCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) return formatCurrency(0);
    return formatCurrency(amount);
  };

  
  const getTotal = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_cost || 0);
      return sum + itemTotal;
    }, 0);
  };

  if (!cart || cart.length === 0) {
    return (
      <Box sx={{ 
        p: 6, 
        textAlign: 'center',
        backgroundColor: alpha(colors.surfaceVariant, 0.3),
        borderRadius: 3,
        border: `2px dashed ${alpha(colors.border, 0.3)}`
      }}>
        <Inventory sx={{ fontSize: 64, color: alpha(theme.palette.text.primary, 0.3), mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search and add products to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(colors.primary, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Unit Cost</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(cart || []).map((item, index) => (
                  <TableRow sx={{ 
                    '&:hover': { 
                      backgroundColor: alpha(colors.primary, 0.03) 
                    },
                    transition: 'background-color 0.2s ease'
                  }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            backgroundColor: alpha(colors.primary, 0.2),
                            color: colors.primary 
                          }}
                        >
                          <Inventory fontSize="small" />
                        </Avatar>
                        <Typography fontWeight={500}>{item.product_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        size="small"
                        inputMode="numeric"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            onUpdateQuantity(item.product_id, 1);
                          } else if (/^\d+$/.test(value)) {
                            const qty = parseInt(value);
                            if (qty > 0 && qty <= 999999) {
                              onUpdateQuantity(item.product_id, qty);
                            }
                          }
                        }}
                        sx={{ 
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
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
                          if (value === '') {
                            onUpdateUnitCost(item.product_id, 0);
                          } else if (/^\d*\.?\d*$/.test(value)) {
                            const cost = parseFloat(value);
                            if (!isNaN(cost) && cost >= 0 && cost <= 999999) {
                              onUpdateUnitCost(item.product_id, cost);
                            }
                          }
                        }}
                        sx={{ 
                          width: 100,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                        slotProps={{ input: { style: { textAlign: 'center' } } }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600} color={colors.primary}>
                        {safeCurrency((item.quantity || 0) * (item.unit_cost || 0))}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remove item">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => onRemoveItem(item.product_id)}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography fontWeight={600}>
                TOTAL:
              </Typography>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Typography variant="h6" fontWeight={700} color={colors.primary}>
                {safeCurrency(getTotal())}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
