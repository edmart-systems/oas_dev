import React, { useState } from 'react'
import PurchaseHistoryTable from './purchaseHistoryTable'
import { toast } from 'react-toastify';
import { Purchase } from '@/modules/inventory/types/purchase.types';
import { Supplier } from '@/modules/inventory/types/supplier.types';
import { InventoryPoint } from '@/modules/inventory/types/inventoryPoint.types';
import { CompanyDto } from '@/types/company.types';
import { Product } from '@/types/product.types';
import { Box, Stack, TablePagination, Typography } from '@mui/material';

const PurchaseHistoryMain = () => {
const [purchases, setPurchases] = useState<Purchase[]>([]);
const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
const [dateError, setDateError] = useState('');
const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [inventoryPoints, setInventoryPoints] = useState<InventoryPoint[]>([]);
const [company, setCompany] = useState<CompanyDto | null>(null);
const [products, setProducts] = useState<Product[]>([]);
      


  return (
    <Stack>
     
  

    </Stack>
  )
}

export default PurchaseHistoryMain