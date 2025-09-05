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
import PurchaseHistoryMain from "@/components/dashboard/inventory/purchase/purchaseHistory/purchaseHistoryMain";
import { Purchase } from "@/modules/inventory/types/purchase.types";
import { CompanyDto } from "@/types/company.types";
import { Location } from "@/modules/inventory/types/location.types";
import { Product } from "@/types/product.types";
import { Supplier } from "@/modules/inventory/types/supplier.types";
import PurchaseHistoryTable from "@/components/dashboard/inventory/purchase/purchaseHistory/purchaseHistoryTable";






const PurchasePage = () => {
const [tabValue, setTabValue] = useState(0);
const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
const [dateError, setDateError] = useState('');
const [purchases, setPurchases] = useState<Purchase[]>([]);
const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [inventoryPoints, setInventoryPoints] = useState<Location[]>([]);
const [company, setCompany] = useState<CompanyDto | null>(null);
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
    // fetch purchases
    const purchaseRes = await fetch("/api/inventory/purchase");
    if (!purchaseRes.ok) throw new Error("Failed to fetch purchases");
    const purchaseData = await purchaseRes.json();

    // 👇 ensure correct structure
    setPurchases(Array.isArray(purchaseData) ? purchaseData : purchaseData.purchases || []);

    // TODO: fetch suppliers, company, products, inventory points here
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Failed to fetch data");
  } finally {
    setLoading(false);
  }
};



  return (
    <Stack>
      <Stack direction="row" spacing={2} alignItems="center">

        {/* Purchase  */}
        <Button
          variant={tabValue === 0 ? "contained" : "outlined"}
          startIcon={<ShoppingCart size={20} />}
          onClick={() => setTabValue(0)}
          color="primary"
        >
          Create Purchase
        </Button>

        {/* Purchase History  */}
        <Button
          variant={tabValue === 1 ? "contained" : "outlined"}
          startIcon={<ListIcon size={20} />}
          onClick={() => setTabValue(1)}
          color="primary"
        >
          Purchase History
        </Button>

        {tabValue === 1 && (
          // Purchase History filters 
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
                </Box></>
          
        )}
      </Stack>
      
      {tabValue === 0 ? (
  <PurchaseMain />
) : loading ? (
  <Typography>Loading purchases...</Typography>
) : filteredPurchases.length === 0 ? (
  <Typography>No purchases found for the selected date range.</Typography>
) : (
  <>
    <PurchaseHistoryTable purchases={filteredPurchases} />
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="body2" color="primary" fontWeight={600}>
        Total Purchase: {totalPurchases}
      </Typography>
      <Typography variant="body2" color="primary" fontWeight={600}>
        Purchase Items: {totalItems}
      </Typography>
    </Box>
  </>
)}

      
      
        </Stack>
  );
};

export default PurchasePage;