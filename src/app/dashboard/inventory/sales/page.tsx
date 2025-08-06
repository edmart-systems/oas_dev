"use client";

import { useState } from "react";
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
  Tabs,
  Tab,
} from "@mui/material";
import { Plus, Minus, Trash, ShoppingCart, MagnifyingGlass, Receipt, List as ListIcon } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Sale {
  id: number;
  saleNumber: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: "Completed" | "Refunded";
}

const SalesPage = () => {
  const [products] = useState<Product[]>([
    { id: 1, name: "Laptop Dell XPS", sku: "DELL001", price: 1200, stock: 25, category: "Electronics" },
    { id: 2, name: "Office Chair", sku: "CHAIR001", price: 250, stock: 15, category: "Furniture" },
    { id: 3, name: "Wireless Mouse", sku: "MOUSE001", price: 35, stock: 50, category: "Electronics" },
    { id: 4, name: "Keyboard", sku: "KEY001", price: 75, stock: 30, category: "Electronics" },
    { id: 5, name: "Monitor", sku: "MON001", price: 300, stock: 20, category: "Electronics" },
    { id: 6, name: "Desk Lamp", sku: "LAMP001", price: 45, stock: 40, category: "Furniture" },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [sales, setSales] = useState<Sale[]>([
    { id: 1, saleNumber: "SALE-001", customer: "John Doe", date: "2024-01-15", items: 3, total: 1485, status: "Completed" },
    { id: 2, saleNumber: "SALE-002", customer: "Jane Smith", date: "2024-01-15", items: 2, total: 325, status: "Completed" },
    { id: 3, saleNumber: "SALE-003", customer: "Bob Wilson", date: "2024-01-14", items: 1, total: 1200, status: "Refunded" },
  ]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const product = products.find(p => p.id === id);
    if (product && quantity <= product.stock) {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.1; // 10% tax
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const processSale = () => {
    if (cart.length === 0) return;
    
    const customerDisplay = customerName.trim() || 'Walk-in Customer';
    
    const newSale: Sale = {
      id: Date.now(),
      saleNumber: `SALE-${String(sales.length + 1).padStart(3, '0')}`,
      customer: customerDisplay,
      date: new Date().toISOString().split('T')[0],
      items: cart.reduce((sum, item) => sum + item.quantity, 0),
      total: getTotal(),
      status: "Completed"
    };
    
    setSales([newSale, ...sales]);
    alert(`Sale processed for ${customerDisplay}\nTotal: $${getTotal().toFixed(2)}`);
    clearCart();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <PageTitle title="Point of Sale" />
      <InventoryHorizontalNav />
      
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
        <Grid container spacing={3}>
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
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 },
                        height: '100%'
                      }}
                      onClick={() => addToCart(product)}
                    >
                      <CardContent>
                        <Typography variant="h6" noWrap>{product.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.sku}
                        </Typography>
                        <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                          ${product.price}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                          <Chip 
                            label={product.category} 
                            size="small" 
                            color="info"
                          />
                          <Typography variant="caption">
                            Stock: {product.stock}
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
                      <ListItem key={item.id} sx={{ px: 0 }}>
                        <ListItemText
                          primary={item.name}
                          secondary={`$${item.price} x ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus size={16} />
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={16} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => removeFromCart(item.id)}
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
                      <Typography>${getSubtotal().toFixed(2)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Tax (10%):</Typography>
                      <Typography>${getTax().toFixed(2)}</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        ${getTotal().toFixed(2)}
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
                  >
                    {customerName.trim() ? `Process Sale for ${customerName}` : 'Process Walk-in Sale'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      ) : (
        <Card>
          <CardHeader title="Sales History" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sale Number</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.saleNumber}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.items}</TableCell>
                      <TableCell>${sale.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={sale.status}
                          color={sale.status === "Completed" ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default SalesPage;