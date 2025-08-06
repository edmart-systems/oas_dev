"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Plus, Minus, Eye, Trash, MagnifyingGlass, ShoppingCart, Receipt, List as ListIcon } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";

interface Product {
  product_id: number;
  product_name: string;
  product_barcode: number;
  product_description: string;
  buying_price: number;
  selling_price: number;
  product_quantity: number;
  category_id: number;
  unit_id: number;
  supplier_id?: number;
}

interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

interface PurchaseOrder {
  purchase_id: number;
  supplier_id: number;
  inventory_point_id: number;
  purchase_quantity: number;
  purchase_unit_cost: number;
  purchase_total_cost: number;
  purchase_created_by?: string;
  created_at: string;
  purchase_items: CartItem[];
}

const PurchasePage = () => {
  const [products] = useState<Product[]>([
    { product_id: 1, product_name: "Laptop Dell XPS", product_barcode: 123001, product_description: "High-performance laptop", buying_price: 1000, selling_price: 1200, product_quantity: 25, category_id: 1, unit_id: 1, supplier_id: 1 },
    { product_id: 2, product_name: "Office Chair", product_barcode: 123002, product_description: "Ergonomic office chair", buying_price: 200, selling_price: 250, product_quantity: 15, category_id: 2, unit_id: 1, supplier_id: 2 },
    { product_id: 3, product_name: "Wireless Mouse", product_barcode: 123003, product_description: "Bluetooth wireless mouse", buying_price: 25, selling_price: 35, product_quantity: 50, category_id: 1, unit_id: 1, supplier_id: 1 },
    { product_id: 4, product_name: "Keyboard", product_barcode: 123004, product_description: "Mechanical keyboard", buying_price: 60, selling_price: 75, product_quantity: 30, category_id: 1, unit_id: 1, supplier_id: 1 },
    { product_id: 5, product_name: "Monitor", product_barcode: 123005, product_description: "24-inch LED monitor", buying_price: 250, selling_price: 300, product_quantity: 20, category_id: 1, unit_id: 1, supplier_id: 3 },
    { product_id: 6, product_name: "Desk Lamp", product_barcode: 123006, product_description: "LED desk lamp", buying_price: 35, selling_price: 45, product_quantity: 40, category_id: 2, unit_id: 1, supplier_id: 2 },
  ]);

  const [orders, setOrders] = useState<PurchaseOrder[]>([
    { purchase_id: 1, supplier_id: 1, inventory_point_id: 1, purchase_quantity: 15, purchase_unit_cost: 1000, purchase_total_cost: 15000, created_at: "2024-01-15", purchase_items: [] },
    { purchase_id: 2, supplier_id: 2, inventory_point_id: 1, purchase_quantity: 8, purchase_unit_cost: 1062.5, purchase_total_cost: 8500, created_at: "2024-01-14", purchase_items: [] },
    { purchase_id: 3, supplier_id: 3, inventory_point_id: 1, purchase_quantity: 100, purchase_unit_cost: 250, purchase_total_cost: 25000, created_at: "2024-01-13", purchase_items: [] },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierId, setSupplierId] = useState<number>(1);
  const [suppliers] = useState([
    { id: 1, name: "Tech Supplies Ltd" },
    { id: 2, name: "Office Furniture Co" },
    { id: 3, name: "Electronics Hub" },
  ]);
  const [tabValue, setTabValue] = useState(0);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      setCart(cart.map(item => 
        item.product_id === product.product_id 
          ? { ...item, quantity: newQuantity, total_cost: item.unit_cost * newQuantity }
          : item
      ));
    } else {
      const cartItem: CartItem = {
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: 1,
        unit_cost: product.buying_price,
        total_cost: product.buying_price
      };
      setCart([...cart, cartItem]);
    }
  };

  const updateQuantity = (product_id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(product_id);
      return;
    }
    setCart(cart.map(item => 
      item.product_id === product_id 
        ? { ...item, quantity, total_cost: item.unit_cost * quantity }
        : item
    ));
  };

  const removeFromCart = (product_id: number) => {
    setCart(cart.filter(item => item.product_id !== product_id));
  };

  const clearCart = () => {
    setCart([]);
    setSupplierId(1);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total_cost, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.1;
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const processPurchase = () => {
    if (cart.length === 0) return;
    
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = getTotal();
    const avgUnitCost = totalCost / totalQuantity;
    
    const newOrder: PurchaseOrder = {
      purchase_id: Date.now(),
      supplier_id: supplierId,
      inventory_point_id: 1,
      purchase_quantity: totalQuantity,
      purchase_unit_cost: avgUnitCost,
      purchase_total_cost: totalCost,
      purchase_created_by: 'current_user',
      created_at: new Date().toISOString().split('T')[0],
      purchase_items: [...cart]
    };
    
    setOrders([newOrder, ...orders]);
    const supplierName = suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
    alert(`Purchase order created for ${supplierName}\nTotal: $${totalCost.toFixed(2)}`);
    clearCart();
  };

  const handleDelete = (purchase_id: number) => {
    setOrders(orders.filter(o => o.purchase_id !== purchase_id));
  };



  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_barcode.toString().includes(searchTerm)
  );

  const filteredOrders = orders.filter(order => {
    const supplier = suppliers.find(s => s.id === order.supplier_id);
    return supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.purchase_id.toString().includes(searchTerm);
  });

  return (
    <Stack spacing={3}>
      
      <Stack direction="row" spacing={2}>
        <Button
          variant={tabValue === 0 ? "contained" : "outlined"}
          startIcon={<ShoppingCart size={20} />}
          onClick={() => setTabValue(0)}
        >
          Create Order
        </Button>
        <Button
          variant={tabValue === 1 ? "contained" : "outlined"}
          startIcon={<ListIcon size={20} />}
          onClick={() => setTabValue(1)}
        >
          Order History
        </Button>
      </Stack>
      
      {tabValue === 0 ? (
        <Grid container spacing={3}>
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
                    <Grid item xs={12} sm={6} md={4} >
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
                          <Typography variant="body2" color="text.secondary">
                            Barcode: {product.product_barcode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {product.product_description}
                          </Typography>
                          <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                            ${product.buying_price}
                          </Typography>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                            <Chip 
                              label={`Stock: ${product.product_quantity}`} 
                              size="small" 
                              color="info"
                            />
                            <Typography variant="caption" color="success.main">
                              Sell: ${product.selling_price}
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
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={supplierId}
                    onChange={(e) => setSupplierId(Number(e.target.value))}
                    label="Supplier"
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
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
                            secondary={`$${item.unit_cost} x ${item.quantity} = $${item.total_cost.toFixed(2)}`}
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
                      onClick={processPurchase}
                      sx={{ mt: 2 }}
                    >
                      Create Purchase Order
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card>
          <CardHeader title="Purchase Orders" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Purchase ID</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Cost</TableCell>
                    <TableCell>Total Cost</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const supplier = suppliers.find(s => s.id === order.supplier_id);
                    return (
                      <TableRow key={order.purchase_id}>
                        <TableCell>PO-{order.purchase_id}</TableCell>
                        <TableCell>{supplier?.name || 'Unknown'}</TableCell>
                        <TableCell>{order.created_at}</TableCell>
                        <TableCell>{order.purchase_quantity}</TableCell>
                        <TableCell>${order.purchase_unit_cost.toFixed(2)}</TableCell>
                        <TableCell>${order.purchase_total_cost.toLocaleString()}</TableCell>
                        <TableCell>
                          <IconButton>
                            <Eye />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(order.purchase_id)} color="error">
                            <Trash />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default PurchasePage;