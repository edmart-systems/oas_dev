"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Stack,
} from "@mui/material";
import {ShoppingCart, List as ListIcon } from "@phosphor-icons/react";
import PurchaseMain from "@/components/dashboard/inventory/purchase/purchaseMain";
import { Product } from "@/modules/inventory/types";
import { CartItem } from "@/modules/inventory/types";
import { PurchaseOrder } from "@/modules/inventory/types";
import { Supplier } from "@/modules/inventory/types";
import { InventoryPoint } from "@/modules/inventory/types";
import PurchaseHistory from "@/components/dashboard/inventory/purchase/purchaseHistory";
import PurchaseDialogs from "@/components/dashboard/inventory/purchase/purchaseDialoges";






const PurchasePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierId, setSupplierId] = useState<number>(1);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryPoints, setInventoryPoints] = useState<InventoryPoint[]>([]);
  const [inventoryPointId, setInventoryPointId] = useState<number>(1);
  const [tabValue, setTabValue] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [openDialog, setOpenDialog] = useState({
    supplier: false,
    inventoryPoint: false,
    product: false,
    deleteConfirm: false
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
      setSuppliers(suppliersData.map((sup: any) => ({ 
        id: sup.supplier_id, 
        name: sup.supplier_name,
        supplier_name: sup.supplier_name,
        supplier_email: sup.supplier_email || ''
      })));
      setInventoryPoints(inventoryPointsData.map((ip: any) => ({ 
        id: ip.inventory_point_id, 
        name: ip.inventory_point,
        inventory_point: ip.inventory_point
      })));
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
      setCart([cartItem, ...cart]);
        
      
    }
    setSearchTerm('');
    setShowDropdown(false);
    setSelectedProductIndex(-1);
  };

  const updateQuantity = (product_id: number, quantity: number) => {
    if (quantity <= 0) return;
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

  const clearCart = () => {
    setCart([]);
    setSupplierId(1);
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
      fetchData();
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

  const handleDialogOpen = (type: keyof typeof openDialog) =>
    setOpenDialog({ ...openDialog, [type]: true });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedProductIndex(-1);
    if (value.trim() && value.length > 2 && !recentSearches.includes(value.trim())) {
      setRecentSearches(prev => [value.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const filteredProducts = products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_barcode.toString().includes(searchTerm)
    );

    if (!searchTerm || filteredProducts.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedProductIndex(prev => 
        prev < filteredProducts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedProductIndex(prev => 
        prev > 0 ? prev - 1 : filteredProducts.length - 1
      );
    } else if (e.key === 'Enter' && selectedProductIndex >= 0) {
      e.preventDefault();
      addToCart(filteredProducts[selectedProductIndex]);
      setSearchTerm('');
      setSelectedProductIndex(-1);
    } else if (e.key === 'Escape') {
      setSearchTerm('');
      setSelectedProductIndex(-1);
    }
  };

  const handleSearchFocus = () => setShowDropdown(true);
  const handleSearchBlur = () => setTimeout(() => setShowDropdown(false), 200);

  const filteredOrders = orders.filter(order => {
    const supplier = suppliers.find(s => s.id === order.supplier_id);
    return supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.purchase_id?.toString().includes(searchTerm);
  });
  

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
        <PurchaseMain
          products={products}
          cart={cart}
          suppliers={suppliers}
          inventoryPoints={inventoryPoints}
          supplierId={supplierId}
          inventoryPointId={inventoryPointId}
          searchTerm={searchTerm}
          recentSearches={recentSearches}
          showDropdown={showDropdown}
          selectedProductIndex={selectedProductIndex}
          loading={loading}
          onSupplierChange={setSupplierId}
          onInventoryPointChange={setInventoryPointId}
          onSearchChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
          onAddToCart={addToCart}
          onCloseDropdown={() => setShowDropdown(false)}
          onUpdateQuantity={updateQuantity}
          onUpdateUnitCost={updateUnitCost}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onProcessPurchase={processPurchase}
          onOpenDialog={handleDialogOpen}
        />
      ) : (
        <PurchaseHistory
          orders={filteredOrders}
          suppliers={suppliers}
          onDelete={handleDelete}
        />
      )}
      
      <PurchaseDialogs
            openDialog={openDialog}
            itemToDelete={null}
            onCloseDialog={(type) => setOpenDialog({ ...openDialog, [type]: false })}
            onConfirmDelete={() => {}}
            onRefreshData={fetchData}
            />
        </Stack>
  );
};

export default PurchasePage;
