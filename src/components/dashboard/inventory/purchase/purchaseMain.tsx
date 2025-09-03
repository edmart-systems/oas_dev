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
  Box
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { Plus, PlusIcon } from "@phosphor-icons/react";
import ProductSearch from "./purchaseSearch";
import PurchaseCart from "./purchaseCart";
import { CartItem } from "@/modules/inventory/types/purchase.types";
import { Product } from "@/types/product.types";
import { Supplier } from "@/modules/inventory/types/supplier.types";
import { toast } from "react-toastify";
import SupplierForm from "../supplier/SupplierForm";
import ProductForm from "../products/productForm";
import { useEffect, useState } from "react";
import MyCircularProgress from "@/components/common/my-circular-progress";




export default function PurchaseMain() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const[processing, setProcessing]= useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [supplierId, setSupplierId] = useState<number>(1);
  const [openForm, setOpenForm] = useState<null | 'product' | 'supplier'>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        fetch('/api/inventory/product'),
        fetch('/api/inventory/supplier')
      ]);
      
      const [productsData, suppliersData] = await Promise.all([
        productsRes.json(),
        suppliersRes.json()
      ]);

      setProducts(productsData);
      setSuppliers(suppliersData.map((sup: any) => ({ 
        id: sup.supplier_id, 
        name: sup.supplier_name,
        supplier_name: sup.supplier_name,
        supplier_email: sup.supplier_email || ''
      })));
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
      setCart([cartItem, ...cart]);
    }
  };

  const updateQuantity = (product_id: number, quantity: number) => {
    setCart(cart.map(item => 
      item.product_id === product_id 
        ? { ...item, quantity, total_cost: item.unit_cost * quantity }
        : item
    ));
  };

  const updateUnitCost = (product_id: number, unit_cost: number) => {
    setCart(cart.map(item => 
      item.product_id === product_id 
        ? { ...item, unit_cost, total_cost: unit_cost * item.quantity }
        : item
    ));
  };

  const removeFromCart = (product_id: number) => {
    setCart(cart.filter(item => item.product_id !== product_id));
  };

  const clearCart = () => setCart([]);

const processPurchase = async () => {
  if (!supplierId || cart.length === 0) {
    toast.error("Please select supplier and add products");
    return;
  }

  setProcessing(true);
  const purchaseData = {
    supplier_id: supplierId,
    purchase_items: cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      total_cost: item.quantity * item.unit_cost
    }))
  };

  try {
    const res = await fetch('/api/inventory/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to create purchase');
    }

    toast.success("Purchase created successfully!");
    clearCart();
    fetchData();
  } catch (error: any) {
    console.error("Failed to create purchase:", error);
    toast.error(error.message || "Failed to create purchase");
  } finally {
    setProcessing(false);
  }
};


  const handleAddForm = (type: 'product' | 'supplier') => {
    setOpenForm(type);
  };

  return (
  

    <Stack spacing={3}>
    <Card>
        <CardHeader
          title="Purchase Order"
          action={
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlusIcon size={16} />}
              onClick={() => handleAddForm('product')}
              disabled={loading}
            >
              Add New Product
            </Button>
          }
        />
        <CardContent>
          {/* Supplier Input */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={supplierId}
                    onChange={(e) => setSupplierId(Number(e.target.value))}
                    label="Supplier"
                    disabled={loading}
                  >
                    {suppliers.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton onClick={() => handleAddForm('supplier')}>
                  <Plus size={20} />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>

          {/* Product Search */}
          <ProductSearch
            products={products}
            onAddToCart={addToCart}
          />

          <Divider sx={{ my: 3 }} />

          {/* Purchase Cart */}
          <PurchaseCart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onUpdateUnitCost={updateUnitCost}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onProcessPurchase={processPurchase}
            loading={processing}
          />
          {loading && <MyCircularProgress/>}
        </CardContent>
      </Card>
      

      {/* Supplier Form */}
      <SupplierForm
        open={openForm === 'supplier'}
        onClose={() => setOpenForm(null)}
        onSuccess={(newSupplier) => {
          setSuppliers(prev => [...prev, newSupplier]);
          setOpenForm(null);
          toast.success("Supplier Added Successfully");
        }}
      />

      {/* Product Form */}
      <ProductForm
        open={openForm === 'product'}
        onCancel={() => setOpenForm(null)}
        onSubmit={(newProduct) => {
          setProducts(prev => [...prev, newProduct]);
          setOpenForm(null);
          toast.success("Product added successfully");
        }}
        initialData={null}
       
      />
    </Stack>
  );
}