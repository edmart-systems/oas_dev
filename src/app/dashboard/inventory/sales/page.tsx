"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Plus, Minus, Trash, ShoppingCart, MagnifyingGlass, Receipt, List as ListIcon } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";
import { toast } from "react-toastify";
import SalesHistoryTable from "@/components/dashboard/inventory/sale/salesHistory/salesHistoryTable";
import { useCurrency } from "@/components/currency/currency-context";

// Backend product row shape (minimal fields used by POS)
interface ProductRow {
  product_id: number;
  product_name: string;
  sku?: string | null;
  selling_price?: number | null;
  product_quantity?: number | null; // aggregate across points
}

interface CartItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
}

interface SaleRow {
  sale_id: number;
  sale_no: string;
  sale_grand_total?: number | null;
  sale_created_at?: string | null;
}

interface InventoryPointRow { inventory_point_id: number; inventory_point: string }

const SalesPage = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [inventoryPoints, setInventoryPoints] = useState<InventoryPointRow[]>([]);
  const [inventoryPointId, setInventoryPointId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { formatCurrency } = useCurrency();

  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${(amount ?? 0).toFixed(2)}`;
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [prodRes, ipRes, salesRes] = await Promise.all([
        fetch("/api/inventory/product", { credentials: "include" }),
        fetch("/api/inventory/inventory_point", { credentials: "include" }),
        fetch("/api/inventory/sale", { credentials: "include" }),
      ]);
      // Products
      if (prodRes.ok) {
        const prods = await prodRes.json();
        setProducts(prods);
      } else {
        const err = await prodRes.json().catch(() => ({}));
        throw new Error(err?.error || err?.message || "Failed to fetch products");
      }
      // Inventory points (tolerate 401 if not logged in client-side)
      if (ipRes.ok) {
        const ips = await ipRes.json();
        setInventoryPoints(ips);
        if (ips?.[0]) setInventoryPointId(ips[0].inventory_point_id);
      } else if (ipRes.status === 401) {
        setInventoryPoints([]);
        setInventoryPointId(1); // fallback to default
      } else {
        const err = await ipRes.json().catch(() => ({}));
        toast.warn(err?.error || err?.message || "Inventory points unavailable");
        setInventoryPoints([]);
      }
      // Sales history
      if (salesRes.ok) {
        const salesList = await salesRes.json();
        setSales(salesList);
      } else {
        const err = await salesRes.json().catch(() => ({}));
        toast.warn(err?.error || err?.message || "Failed to fetch sales history");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load POS data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const addToCart = (product: ProductRow) => {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product_id: product.product_id, product_name: product.product_name, unit_price: product.selling_price ?? 0, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => 
      item.product_id === id ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.product_id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.1; // 10% tax
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const processSale = async () => {
    if (cart.length === 0) return;
    try {
      setLoading(true);
      const sale_no = `S${Date.now().toString().slice(-10)}`.slice(0, 12);
      const body: any = {
        sale_no,
        seller_id: 1, // TODO: wire to current user
        currency_id: 1, // TODO: wire to selected currency
        sale_items: cart.map(ci => ({
          product_id: ci.product_id,
          quantity: ci.quantity,
          unit_price: ci.unit_price,
          discount: 0,
          tax: 0,
        })),
      };
      if (typeof inventoryPointId === 'number' && !Number.isNaN(inventoryPointId)) {
        body.inventory_point_id = inventoryPointId;
      }
      const res = await fetch("/api/inventory/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || err?.message || "Failed to process sale");
      }
      toast.success("Sale processed successfully");
      clearCart();
      // refresh history
      const salesRes = await fetch("/api/inventory/sale", { credentials: "include" });
      if (salesRes.ok) setSales(await salesRes.json());
    } catch (e: any) {
      toast.error(e.message || "Failed to process sale");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return products;
    return products.filter(p =>
      (p.product_name || "").toLowerCase().includes(term) ||
      (p.sku || "").toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  return (
    <Stack >
      
      <Stack direction="row" spacing={2}>
        <Button
          variant={tabValue === 0 ? "contained" : "outlined"}
          startIcon={<ShoppingCart size={20} />}
          onClick={() => setTabValue(0)}
        >
          POS
        </Button>
        <Button
          variant={tabValue === 1 ? "contained" : "outlined"}
          startIcon={<ListIcon size={20} />}
          onClick={() => setTabValue(1)}
        >
          Sales History
        </Button>
      </Stack>
      
      {tabValue === 0 ? (
        <Grid container spacing={3} mt={0}>
        {/* Products Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Products"
              action={
                <TextField
                  size="small"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <MagnifyingGlass size={20} />,
                  }}
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.product_id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 },
                        height: '100%'
                      }}
                      onClick={() => addToCart(product)}
                    >
                      <CardContent>
                        <Typography variant="h6" noWrap>{product.product_name}</Typography>
                        {product.sku && (
                          <Typography variant="body2" color="text.secondary">
                            {product.sku}
                          </Typography>
                        )}
                        <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                          {safeCurrency(product.selling_price ?? 0)}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                          <Chip 
                            label={"Product"} 
                            size="small" 
                            color="info"
                          />
                          <Typography variant="caption">
                            Stock: {product.product_quantity ?? '-'}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cart Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ShoppingCart size={20} />
                  <span>Cart ({cart.length})</span>
                </Stack>
              }
              action={
                cart.length > 0 && (
                  <Button size="small" onClick={clearCart} color="error">
                    Clear
                  </Button>
                )
              }
            />
            <CardContent>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Inventory Point</InputLabel>
                <Select
                  label="Inventory Point"
                  value={inventoryPointId}
                  onChange={(e) => setInventoryPointId(Number(e.target.value))}
                >
                  {inventoryPoints.map(ip => (
                    <MenuItem key={ip.inventory_point_id} value={ip.inventory_point_id}>{ip.inventory_point}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                fullWidth
                size="small"
                placeholder="Leave empty for walk-in customer"
                sx={{ mb: 2 }}
              />
              
              {cart.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  Cart is empty
                </Typography>
              ) : (
                <>
                  <List dense>
                    {cart.map((item) => (
                      <ListItem key={item.product_id} sx={{ px: 0 }}>
                        <ListItemText
                          primary={item.product_name}
                          secondary={`${safeCurrency(item.unit_price)} x ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              <Minus size={16} />
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              <Plus size={16} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash size={16} />
                            </IconButton>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Subtotal:</Typography>
                      <Typography>{safeCurrency(getSubtotal())}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Tax (10%):</Typography>
                      <Typography>{safeCurrency(getTax())}</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        {safeCurrency(getTotal())}
                      </Typography>
                    </Stack>
                  </Stack>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Receipt />}
                    onClick={processSale}
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (customerName.trim() ? `Process Sale for ${customerName}` : 'Process Walk-in Sale')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      ) : (
        <SalesHistoryTable sales={sales as any} />
      )}
    </Stack>
  );
};

export default SalesPage;