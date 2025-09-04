"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Stack,
  TextField,
  Box,
  Chip,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  alpha,
  useTheme,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { ShoppingCart, History, TrendingUp, Inventory } from "@mui/icons-material";
import PurchaseMain from "@/components/dashboard/inventory/purchase/purchaseMain";
import { Purchase } from "@/modules/inventory/types/purchase.types";
import { Product } from "@/types/product.types";
import { Supplier } from "@/modules/inventory/types/supplier.types";
import PurchaseCart from "@/components/dashboard/inventory/purchase/purchaseCart";
import PurchaseHistoryTable from "@/components/dashboard/inventory/purchase/purchaseHistory/purchaseHistoryTable";
import { useCurrency } from "@/components/currency/currency-context";

const PurchasePage = () => {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  const colors = {
    primary: "#D98219",
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : "#ffffff",
    border: theme.palette.divider,
  };

  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateError, setDateError] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

const handleEndDateChange = (value: string) => {
    if (value && startDate && new Date(value) < new Date(startDate)) {
      setDateError('End date cannot be earlier than start date');
      toast.error('End date cannot be earlier than start date');
      return;
    }
    setDateError('');
    setEndDate(value);
  };

  const handleQuickFilter = (filter: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (filter) {
      case 'today':
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        setStartDate(yesterdayStr);
        setEndDate(yesterdayStr);
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        setStartDate(weekAgo.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        setStartDate(monthAgo.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
    }
    setDateError('');
  };

  const filteredPurchases = purchases.filter(purchase => {
        const purchaseDate = purchase.purchase_created_at ? new Date(purchase.purchase_created_at) : null;
        if (!purchaseDate) return false;
        
        // Get date in local timezone to match input format
        const year = purchaseDate.getFullYear();
        const month = String(purchaseDate.getMonth() + 1).padStart(2, '0');
        const day = String(purchaseDate.getDate()).padStart(2, '0');
        const purchaseDateStr = `${year}-${month}-${day}`;
        
        // If both start and end dates are provided, check for date range
        if (startDate && endDate) {
          return purchaseDateStr >= startDate && purchaseDateStr <= endDate;
        }
        
        // If only start date is provided, check for specific date
        if (startDate && !endDate) {
          return purchaseDateStr === startDate;
        }
        
        // If only end date is provided, check for specific date
        if (!startDate && endDate) {
          return purchaseDateStr === endDate;
        }
        
        return false;
      });
  
  const totalPurchases = filteredPurchases.reduce((sum, purchase) => {
      return sum + (purchase.purchase_total_cost || 0);
    }, 0);
    
    const totalItems = filteredPurchases.reduce((sum, purchase) => {
      return sum + (purchase.purchase_quantity || 0);
    }, 0);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  setLoading(true);
  try {
    const [purchaseRes, supplierRes, productRes] = await Promise.all([
      fetch("/api/inventory/purchase"),
      fetch("/api/inventory/supplier"),
      fetch("/api/inventory/product")
    ]);

    // Handle purchases
    if (purchaseRes.ok) {
      const purchaseData = await purchaseRes.json();
      setPurchases(Array.isArray(purchaseData) ? purchaseData : purchaseData.purchases || []);
    } else {
      console.error("Failed to fetch purchases:", purchaseRes.statusText);
    }

    // Handle suppliers
    if (supplierRes.ok) {
      const supplierData = await supplierRes.json();
      setSuppliers(Array.isArray(supplierData) ? supplierData : supplierData.suppliers || []);
    } else {
      console.error("Failed to fetch suppliers:", supplierRes.statusText);
    }

    // Handle products
    if (productRes.ok) {
      const productData = await productRes.json();
      setProducts(Array.isArray(productData) ? productData : productData.products || []);
    } else {
      console.error("Failed to fetch products:", productRes.statusText);
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Failed to fetch data. Please refresh the page.");
  } finally {
    setLoading(false);
  }
};

const handleProcessPurchase = async (purchaseData: any) => {
  try {
    const response = await fetch("/api/inventory/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supplier_id: purchaseData.supplierId,
        purchase_items: purchaseData.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.quantity * item.unit_cost
        }))
      }),
    });

    if (response.ok) {
      await fetchData(); // Refresh all data
      toast.success("Purchase created successfully!");
      return true;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create purchase");
    }
  } catch (error: any) {
    console.error("Purchase processing failed:", error);
    toast.error(error.message || "Failed to create purchase. Please try again.");
    return false;
  }
};



  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${alpha(colors.primary, 0.02)}, ${alpha(colors.surfaceVariant, 0.5)})`,
      
    }}>
      <Stack spacing={4}>
        {/* Header Navigation */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 4,
          backgroundColor: alpha(colors.surface, 0.9),
          backdropFilter: 'blur(20px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          border: `1px solid ${alpha(colors.border, 0.1)}`,
        }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Button
              variant={tabValue === 0 ? "contained" : "outlined"}
              startIcon={<ShoppingCart />}
              onClick={() => setTabValue(0)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 600,
                ...(tabValue === 0 ? {
                  backgroundColor: colors.primary,
                  boxShadow: `0 8px 20px ${alpha(colors.primary, 0.3)}`,
                  '&:hover': {
                    backgroundColor: alpha(colors.primary, 0.9),
                  }
                } : {
                  borderColor: alpha(colors.primary, 0.3),
                  color: colors.primary,
                  '&:hover': {
                    borderColor: colors.primary,
                    backgroundColor: alpha(colors.primary, 0.05),
                  }
                })
              }}
            >
              Create Purchase
            </Button>

            <Button
              variant={tabValue === 1 ? "contained" : "outlined"}
              startIcon={<History />}
              onClick={() => setTabValue(1)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 600,
                ...(tabValue === 1 ? {
                  backgroundColor: colors.primary,
                  boxShadow: `0 8px 20px ${alpha(colors.primary, 0.3)}`,
                  '&:hover': {
                    backgroundColor: alpha(colors.primary, 0.9),
                  }
                } : {
                  borderColor: alpha(colors.primary, 0.3),
                  color: colors.primary,
                  '&:hover': {
                    borderColor: colors.primary,
                    backgroundColor: alpha(colors.primary, 0.05),
                  }
                })
              }}
            >
              Purchase History
            </Button>

            {tabValue === 1 && (
              <>
                <Divider orientation="vertical" flexItem />
                <Box display="flex" gap={2} alignItems="center">
                  <TextField
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    size="small"
                    error={!!dateError}
                    helperText={dateError}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
                <Box display="flex" gap={1}>
                  <Chip 
                    label="Today" 
                    onClick={() => handleQuickFilter('today')} 
                    clickable 
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      '&:hover': {
                        backgroundColor: alpha(colors.primary, 0.2),
                      }
                    }}
                  />
                  <Chip 
                    label="Yesterday" 
                    onClick={() => handleQuickFilter('yesterday')} 
                    clickable 
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      '&:hover': {
                        backgroundColor: alpha(colors.primary, 0.2),
                      }
                    }}
                  />
                  <Chip 
                    label="Last Week" 
                    onClick={() => handleQuickFilter('week')} 
                    clickable 
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      '&:hover': {
                        backgroundColor: alpha(colors.primary, 0.2),
                      }
                    }}
                  />
                  <Chip 
                    label="Last Month" 
                    onClick={() => handleQuickFilter('month')} 
                    clickable 
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      '&:hover': {
                        backgroundColor: alpha(colors.primary, 0.2),
                      }
                    }}
                  />
                </Box>
              </>
            )}
          </Stack>
        </Paper>

        {/* Content */}
        {tabValue === 0 ? (
          <PurchaseMain 
            products={products}
            suppliers={suppliers}
            onProcessPurchase={handleProcessPurchase}
            onDataRefresh={fetchData}
            loading={loading}
          />
        ) : (
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
            border: `1px solid ${alpha(colors.border, 0.1)}`,
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom color={colors.primary}>
                    Purchase History
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    View and manage your purchase records
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Card sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)}, ${alpha(colors.primary, 0.05)})`,
                    border: `1px solid ${alpha(colors.primary, 0.2)}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: alpha(colors.primary, 0.2),
                        color: colors.primary 
                      }}>
                        <TrendingUp />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Purchases
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color={colors.primary}>
                          {formatCurrency(totalPurchases)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                  <Card sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(colors.warning, 0.1)}, ${alpha(colors.warning, 0.05)})`,
                    border: `1px solid ${alpha(colors.warning, 0.2)}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: alpha(colors.warning, 0.2),
                        color: colors.warning 
                      }}>
                        <Inventory/>
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Items
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color={colors.warning}>
                          {totalItems}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              </Box>

              {/* Purchase History Table */}
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: colors.primary }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading purchases...
                  </Typography>
                </Box>
              ) : filteredPurchases.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <History sx={{ fontSize: 64, color: alpha(theme.palette.text.primary, 0.3), mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No purchases found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No purchases found for the selected date range
                  </Typography>
                </Box>
              ) : (
                <PurchaseHistoryTable purchases={filteredPurchases} loading={loading} />
              )}

              {/* Summary Footer */}
              {filteredPurchases.length > 0 && (
                <Box sx={{ 
                  mt: 3, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: alpha(colors.surfaceVariant, 0.3),
                  borderRadius: 3
                }}>
                  <Typography variant="body1" fontWeight={600} color={colors.primary}>
                    Showing {filteredPurchases.length} purchases from {startDate} to {endDate}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      Total Items: <span style={{ color: colors.warning }}>{totalItems}</span>
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      Total Value: <span style={{ color: colors.primary }}>{formatCurrency(totalPurchases)}</span>
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
};

export default PurchasePage;