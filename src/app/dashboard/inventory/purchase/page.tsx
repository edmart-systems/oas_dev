"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { saveOrUpdate } from "@/components/dashboard/inventory/form-handlers";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { Plus, Minus, Eye, Trash, MagnifyingGlass, ShoppingCart, Receipt, List as ListIcon } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";
import ProductForm from "@/components/dashboard/inventory/products/productForm";


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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierId, setSupplierId] = useState<number>(1);
  const [suppliers, setSuppliers] = useState<{id: number, name: string}[]>([]);
  const [inventoryPoints, setInventoryPoints] = useState<{id: number, name: string}[]>([]);
  const [inventoryPointId, setInventoryPointId] = useState<number>(1);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState({
    supplier: false,
    inventoryPoint: false,
    product: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, suppliersRes, purchasesRes, inventoryPointsRes] = await Promise.all([
        fetch('/api/inventory/product'),
        fetch('/api/inventory/supplier'),
        fetch('/api/inventory/purchase'),
        fetch('/api/inventory/inventory_point')
      ]);
      
      const [productsData, suppliersData, purchasesData, inventoryPointsData] = await Promise.all([
        productsRes.json(),
        suppliersRes.json(),
        purchasesRes.json(),
        inventoryPointsRes.json()
      ]);
      
      setProducts(productsData);
      setSuppliers(suppliersData.map((sup: any) => ({ id: sup.supplier_id, name: sup.supplier_name })));
      setInventoryPoints(inventoryPointsData.map((ip: any) => ({ id: ip.inventory_point_id, name: ip.inventory_point })));
      setOrders(purchasesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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

  const processPurchase = async () => {
    if (cart.length === 0) return;
    
    const purchaseData = {
      inventory_point_id: inventoryPointId,
      supplier_id: supplierId,
      purchase_items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost
      }))
    };
    
    try {
      const res = await fetch('/api/inventory/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });
      
      if (!res.ok) throw new Error('Failed to create purchase order');
      
      const newOrder = await res.json();
      setOrders([newOrder, ...orders]);
      
      const supplierName = suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
      toast.success(`Purchase order created for ${supplierName}`);
      clearCart();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to create purchase:', error);
      toast.error('Failed to create purchase order');
    }
  };

  const handleDelete = async (purchase_id: number) => {
    try {
      const res = await fetch(`/api/inventory/purchase/${purchase_id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete purchase order');
      
      setOrders(orders.filter(o => o.purchase_id !== purchase_id));
      toast.success('Purchase order deleted');
    } catch (error) {
      console.error('Failed to delete purchase:', error);
      toast.error('Failed to delete purchase order');
    }
  };

  const handleAddSupplier = async (supplierData: any) => {
    try {
      const res = await fetch('/api/inventory/supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData)
      });
      
      if (!res.ok) throw new Error('Failed to add supplier');
      
      const newSupplier = await res.json();
      const supplierOption = { id: newSupplier.supplier_id, name: newSupplier.supplier_name };
      setSuppliers([...suppliers, supplierOption]);
      setSupplierId(newSupplier.supplier_id);
      setOpenDialog({ ...openDialog, supplier: false });
      toast.success('Supplier added successfully');
    } catch (error) {
      toast.error('Failed to add supplier');
    }
  };

  const handleAddInventoryPoint = async (pointData: any) => {
    try {
      const res = await fetch('/api/inventory/inventory_point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pointData)
      });
      
      if (!res.ok) throw new Error('Failed to add inventory point');
      
      const newPoint = await res.json();
      const pointOption = { id: newPoint.inventory_point_id, name: newPoint.inventory_point };
      setInventoryPoints([...inventoryPoints, pointOption]);
      setInventoryPointId(newPoint.inventory_point_id);
      setOpenDialog({ ...openDialog, inventoryPoint: false });
      toast.success('Inventory point added successfully');
    } catch (error) {
      toast.error('Failed to add inventory point');
    }
  };

  const handleAddProduct = async (productData: any) => {
    try {
      const res = await fetch('/api/inventory/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!res.ok) throw new Error('Failed to add product');
      
      const newProduct = await res.json();
      setProducts([...products, newProduct]);
      setOpenDialog({ ...openDialog, product: false });
      toast.success('Product added successfully');
    } catch (error) {
      toast.error('Failed to add product');
    }
  };



  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_barcode.toString().includes(searchTerm)
  );

  const filteredOrders = orders.filter(order => {
    const supplier = suppliers.find(s => s.id === order.supplier_id);
    return supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.purchase_id?.toString().includes(searchTerm);
  });

  const updateUnitCost = (product_id: number, unit_cost: number) => {
  setCart(cart.map(item => 
    item.product_id === product_id 
      ? { ...item, unit_cost, total_cost: unit_cost * item.quantity }
      : item
  ));
};

  return (
    <Stack>
      
      <Stack direction="row" spacing={2}>
        <Button
          variant={tabValue === 0 ? "contained" : "outlined"}
          startIcon={<ShoppingCart size={20} />}
          onClick={() => setTabValue(0)}
        >
          Create Purchase
        </Button>
        <Button
          variant={tabValue === 1 ? "contained" : "outlined"}
          startIcon={<ListIcon size={20} />}
          onClick={() => setTabValue(1)}
        >
          Purchase History
        </Button>
      </Stack>
      
      {tabValue === 0 ? (
        <Grid container spacing={3} mt={0}>
          <Grid size={{xs:12 , md:8}} >
            <Card>

              {/* Search form  */}
              <CardHeader
                title="Products"
                action={
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: <MagnifyingGlass size={20} />,
                        },
                      }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Plus size={16} />}
                      onClick={() => setOpenDialog({ ...openDialog, product: true })}
                    >
                      Add Product
                    </Button>
                  </Stack>
                }
              />

              {/* Products List  */}
              <CardContent>
                {loading ? (
                  <Typography>Loading products...</Typography>
                ) : (
                <Grid container spacing={2}>
                  {filteredProducts.map((product) => (
                    <Grid size={{xs:12 , md:4, sm:6}} >
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
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Purchase cart  */}

          <Grid size={{xs:12 , md:4}}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardHeader
                title={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ShoppingCart size={20} />
                    <span> Purchase Cart ({cart.length})</span>
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

                {/* Supplier Form  */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <FormControl fullWidth size="small">
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
                  <IconButton onClick={() => setOpenDialog({ ...openDialog, supplier: true })}>
                    <Plus size={20} />
                  </IconButton>
                </Stack>
                
                {/* Inventory point Form  */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Inventory Point</InputLabel>
                    <Select
                      value={inventoryPointId}
                      onChange={(e) => setInventoryPointId(Number(e.target.value))}
                      label="Inventory Point"
                    >
                      {inventoryPoints.map((point) => (
                        <MenuItem key={point.id} value={point.id}>
                          {point.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton onClick={() => setOpenDialog({ ...openDialog, inventoryPoint: true })}>
                    <Plus size={20} />
                  </IconButton>
                </Stack>
                
                {cart.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                   Purchase Cart is empty
                  </Typography>
                ) : (
                  <>
                    <TableContainer>
                      <Table size="small">
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
                          {cart.map((item) => (
                            <TableRow key={item.product_id}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell align="center">
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 0)}
                                  sx={{ width: 70 }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.unit_cost}
                                  onChange={(e) => updateUnitCost(item.product_id, parseFloat(e.target.value) || 0)}
                                  sx={{ width: 90 }}
                                />
                              </TableCell>
                              <TableCell align="center">${item.total_cost.toFixed(2)}</TableCell>
                              <TableCell align="center">
                                <IconButton size="small" color="error" onClick={() => removeFromCart(item.product_id)}>
                                  <Trash size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    
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
      
      {/* Add Supplier Dialog */}
      <Dialog open={openDialog.supplier} onClose={() => setOpenDialog({ ...openDialog, supplier: false })}>
        <DialogTitle>Add New Supplier</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField label="Supplier Name" fullWidth />
            <TextField label="Email" type="email" fullWidth />
            <TextField label="Phone" fullWidth />
            <TextField label="Address" multiline rows={2} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog({ ...openDialog, supplier: false })}>Cancel</Button>
          <Button variant="contained">Add Supplier</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Inventory Point Dialog */}
      <Dialog open={openDialog.inventoryPoint} onClose={() => setOpenDialog({ ...openDialog, inventoryPoint: false })}>
        <DialogTitle>Add New Inventory Point</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField label="Inventory Point Name" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog({ ...openDialog, inventoryPoint: false })}>Cancel</Button>
          <Button variant="contained">Add Inventory Point</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Product Dialog */}
      <Dialog open={openDialog.product} onClose={() => setOpenDialog({ ...openDialog, product: false })} maxWidth="md" fullWidth>
        <DialogContent>
          <ProductForm
            onSubmit={async (data) => {
              await saveOrUpdate({
                endpoint: '/api/inventory/product',
                data,
                onSuccess: () => {
                  fetchData();
                  setOpenDialog({ ...openDialog, product: false });
                }
              });
            }}
            onCancel={() => setOpenDialog({ ...openDialog, product: false })}
          />
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default PurchasePage;