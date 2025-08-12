"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Stack,
  TablePagination,
  TextField,
  Box,
  Chip,
  Typography,
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
import { usePagination } from "@/hooks/usePagination";
import { useCurrency } from "@/components/currency/currency-context";






const PurchasePage = () => {
    const { formatCurrency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
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

  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };
  
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
      setPurchases(purchasesData);
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
      
      if (!res.ok) throw new Error('Failed to create purchase purchase');
      
      const newPurchase = await res.json();
      setPurchases([newPurchase, ...purchases]);
      
      const supplierName = suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
      toast.success(`Purchase purchase created for ${supplierName}`);
      clearCart();
      fetchData();
    } catch (error) {
      console.error('Failed to create purchase:', error);
      toast.error('Failed to create purchase purchase');
    }
  };

  const handleDelete = async (purchase_id: number) => {
    try {
      const res = await fetch(`/api/inventory/purchase/${purchase_id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete purchase purchase');
      
      setPurchases(purchases.filter(o => o.purchase_id !== purchase_id));
      toast.success('Purchase purchase deleted');
    } catch (error) {
      console.error('Failed to delete purchase:', error);
      toast.error('Failed to delete purchase purchase');
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateError, setDateError] = useState('');

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

  const filteredPurchases = purchases.filter(order => {
    const orderDate = order.purchase_created_at ? new Date(order.purchase_created_at) : null;
    if (!orderDate) return false;
    
    // Get date in local timezone to match input format
    const year = orderDate.getFullYear();
    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
    const day = String(orderDate.getDate()).padStart(2, '0');
    const orderDateStr = `${year}-${month}-${day}`;
    
    // If both start and end dates are provided, check for date range
    if (startDate && endDate) {
      return orderDateStr >= startDate && orderDateStr <= endDate;
    }
    
    // If only start date is provided, check for specific date
    if (startDate && !endDate) {
      return orderDateStr === startDate;
    }
    
    // If only end date is provided, check for specific date
    if (!startDate && endDate) {
      return orderDateStr === endDate;
    }
    
    return false;
  });
  
  const paginatedPurchases = filteredPurchases.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const totalPurchases = filteredPurchases.reduce((sum, purchase) => {
    return sum + (purchase.purchase_total_cost || 0);
  }, 0);
  
  const totalItems = filteredPurchases.reduce((sum, purchase) => {
    return sum + (purchase.purchase_quantity || 0);
  }, 0);
  

  return (
    <Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant={tabValue === 0 ? "contained" : "outlined"}
          startIcon={<ShoppingCart size={20} />}
          onClick={() => setTabValue(0)}
          color="primary"
        >
          Create Purchase
        </Button>
        <Button
          variant={tabValue === 1 ? "contained" : "outlined"}
          startIcon={<ListIcon size={20} />}
          onClick={() => setTabValue(1)}
          color="primary"
        >
          Purchase History
        </Button>
        {tabValue === 1 && (
          <>
            <Box display="flex" gap={2}>
              <TextField
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
                color="primary"
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
                color="primary"
              />
            </Box>
            <Box display="flex" gap={1}>
              <Chip label="Today" onClick={() => handleQuickFilter('today')} clickable size="small" color="primary" />
              <Chip label="Yesterday" onClick={() => handleQuickFilter('yesterday')} clickable size="small" color="primary" />
              <Chip label="Last Week" onClick={() => handleQuickFilter('week')} clickable size="small" color="primary" />
              <Chip label="Last Month" onClick={() => handleQuickFilter('month')} clickable size="small" color="primary" />
            </Box>
          </>
        )}
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
        <>
          <PurchaseHistory
            orders={paginatedPurchases}
            suppliers={suppliers}
            inventoryPoints={inventoryPoints}
            products={products}
            onDelete={handleDelete}
            company={{
              co_id: 1,
              legal_name: "Your Company Name",
              business_name: "Your Business",
              tin: null,
              email: "company@example.com",
              phone_number_1: "+256700000000",
              phone_number_2: null,
              landline_number: null,
              logo: null,
              web: null,
              address: {
                co_ad_id: 1,
                co_id: 1,
                branch_number: "001",
                branch_name: "Main Branch",
                box_number: "123",
                street: "123 Business St",
                plot_number: "456",
                building_name: "Business Plaza",
                floor_number: 1,
                room_number: "101",
                country: "Uganda",
                district: "Kampala",
                county: "Central",
                subcounty: "Nakawa",
                village: "Business Village"
              }
            }}
          />
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="primary" fontWeight={600}>
              Total Purchase: {safeCurrency(totalPurchases || 0)}
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={600}>
                Purchase Items: {totalItems}
            </Typography>
            <TablePagination
              component="div"
              count={filteredPurchases.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5]}
              sx={{
                '& .MuiTablePagination-actions button': {
                  color: 'primary.main',
                },
                '& .MuiTablePagination-selectIcon': {
                  color: 'primary.main',
                }
              }}
            />
          </Box>
        </>

        
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
