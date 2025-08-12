# Purchase PDF System Implementation - Code Documentation

## Overview
This document explains every line of code implemented today for creating a complete PDF generation system for purchase orders in the inventory management system.

## Files Created/Modified

### 1. Purchase Types Definition
**File**: `src/types/purchase.types.ts`

```typescript
export interface PurchaseItem {
  id: number;
  name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface PurchaseOrder {
  id: string;
  purchase_order_number: string;
  supplier_name: string;
  purchase_created_at: string;
  purchase_total_cost: number;
  items: PurchaseItem[];
  notes?: string;
}
```

**Line-by-line explanation:**
- **Lines 1-6**: Define `PurchaseItem` interface with essential fields for individual purchase items
- **Lines 8-15**: Define `PurchaseOrder` interface containing order metadata and array of items
- **Line 15**: Optional `notes` field for additional purchase information

### 2. PDF Document Component
**File**: `src/components/dashboard/inventory/purchase/purchase-pdf/purchase-pdf-doc.tsx`

```typescript
"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { PurchaseOrder } from '@/types/purchase.types';
import { CompanyDto } from '@/types/company.types';
```

**Line-by-line explanation:**
- **Line 1**: Client-side component directive for Next.js
- **Line 3**: React import for component creation
- **Line 4**: Import PDF rendering components from react-pdf/renderer
- **Lines 5-6**: Import TypeScript interfaces for type safety

```typescript
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    marginBottom: 2,
    color: '#666666',
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  invoiceDate: {
    fontSize: 10,
    color: '#666666',
  },
  supplierSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  supplierName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
  },
  itemColumn: {
    flex: 3,
  },
  qtyColumn: {
    flex: 1,
    textAlign: 'center',
  },
  priceColumn: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalColumn: {
    flex: 1.5,
    textAlign: 'right',
  },
  summary: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 20,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'right',
  },
});
```

**Line-by-line explanation:**
- **Line 8**: Create stylesheet object for PDF styling
- **Lines 9-14**: Page layout styles with white background and padding
- **Lines 15-20**: Header section with row layout and space distribution
- **Lines 21-23**: Company info section styling
- **Lines 24-28**: Company name styling with bold font
- **Lines 29-33**: Company details styling with smaller font and gray color
- **Lines 34-36**: Invoice info alignment
- **Lines 37-42**: Invoice title styling with large font
- **Lines 43-47**: Invoice number styling
- **Lines 48-51**: Invoice date styling
- **Lines 52-57**: Supplier section with background and padding
- **Lines 58-63**: Section title styling
- **Lines 64-67**: Supplier name styling
- **Lines 68-70**: Table container styling
- **Lines 71-76**: Table header with background color
- **Lines 77-82**: Table row with border
- **Lines 83-85**: Base table cell styling
- **Lines 86-88**: Item column width (3x flex)
- **Lines 89-92**: Quantity column with center alignment
- **Lines 93-96**: Price column with right alignment
- **Lines 97-100**: Total column with right alignment
- **Lines 101-104**: Summary section alignment
- **Lines 105-108**: Summary row layout
- **Lines 109-113**: Summary label styling
- **Lines 114-119**: Summary value styling with fixed width

```typescript
interface Props {
  purchaseOrder: PurchaseOrder;
  company: CompanyDto;
}

const PurchasePDFDoc: React.FC<Props> = ({ purchaseOrder, company }) => {
```

**Line-by-line explanation:**
- **Lines 122-125**: Define component props interface requiring purchase order and company data
- **Line 127**: Component function declaration with typed props

```typescript
return (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{company.business_name || company.legal_name}</Text>
          <Text style={styles.companyDetails}>{company.email}</Text>
          <Text style={styles.companyDetails}>{company.phone_number_1}</Text>
          {company.address && (
            <Text style={styles.companyDetails}>
              {company.address.street}, {company.address.district}
            </Text>
          )}
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceTitle}>PURCHASE ORDER</Text>
          <Text style={styles.invoiceNumber}>#{purchaseOrder.purchase_order_number}</Text>
          <Text style={styles.invoiceDate}>
            Date: {new Date(purchaseOrder.purchase_created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
```

**Line-by-line explanation:**
- **Lines 129-130**: Create PDF document with A4 page
- **Lines 131-132**: Header container
- **Lines 133-143**: Company information section with conditional address display
- **Lines 144-150**: Purchase order header with number and formatted date

```typescript
<View style={styles.supplierSection}>
  <Text style={styles.sectionTitle}>Supplier Information</Text>
  <Text style={styles.supplierName}>{purchaseOrder.supplier_name}</Text>
</View>
```

**Line-by-line explanation:**
- **Lines 152-155**: Supplier information section with title and name

```typescript
<View style={styles.table}>
  <View style={styles.tableHeader}>
    <Text style={[styles.tableCell, styles.itemColumn]}>Item</Text>
    <Text style={[styles.tableCell, styles.qtyColumn]}>Qty</Text>
    <Text style={[styles.tableCell, styles.priceColumn]}>Unit Cost</Text>
    <Text style={[styles.tableCell, styles.totalColumn]}>Total</Text>
  </View>
  
  {purchaseOrder.items.map((item, index) => (
    <View key={index} style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.itemColumn]}>{item.name}</Text>
      <Text style={[styles.tableCell, styles.qtyColumn]}>{item.quantity}</Text>
      <Text style={[styles.tableCell, styles.priceColumn]}>
        ${item.unit_cost.toFixed(2)}
      </Text>
      <Text style={[styles.tableCell, styles.totalColumn]}>
        ${item.total_cost.toFixed(2)}
      </Text>
    </View>
  ))}
</View>
```

**Line-by-line explanation:**
- **Lines 157-163**: Table header with column titles
- **Lines 165-175**: Map through items to create table rows with formatted currency

```typescript
<View style={styles.summary}>
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>Total Amount:</Text>
    <Text style={styles.summaryValue}>
      ${purchaseOrder.purchase_total_cost.toFixed(2)}
    </Text>
  </View>
</View>
```

**Line-by-line explanation:**
- **Lines 177-184**: Summary section displaying total purchase amount

### 3. PDF Preview Dialog
**File**: `src/components/dashboard/inventory/purchase/purchase-pdf/purchase-view-dialog.tsx`

```typescript
"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from '@mui/material';
import { X } from '@phosphor-icons/react';
import { PDFViewer } from '@react-pdf/renderer';
import PurchasePDFDoc from './purchase-pdf-doc';
import { PurchaseOrder } from '@/types/purchase.types';
import { CompanyDto } from '@/types/company.types';
```

**Line-by-line explanation:**
- **Lines 1-15**: Import necessary components for dialog and PDF viewing

```typescript
interface Props {
  open: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder;
  company: CompanyDto;
}

const PurchaseViewDialog: React.FC<Props> = ({ open, onClose, purchaseOrder, company }) => {
```

**Line-by-line explanation:**
- **Lines 17-22**: Define component props interface
- **Line 24**: Component function with typed props

```typescript
return (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="lg"
    fullWidth
    PaperProps={{
      sx: {
        height: '90vh',
        maxHeight: '90vh',
      },
    }}
  >
```

**Line-by-line explanation:**
- **Lines 25-36**: Dialog configuration with large width and 90% viewport height

```typescript
<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  Purchase Order Preview
  <IconButton onClick={onClose} size="small">
    <X size={20} />
  </IconButton>
</DialogTitle>
```

**Line-by-line explanation:**
- **Lines 37-42**: Dialog title with close button

```typescript
<DialogContent sx={{ p: 0, height: '100%' }}>
  <Box sx={{ width: '100%', height: '100%' }}>
    <PDFViewer width="100%" height="100%">
      <PurchasePDFDoc purchaseOrder={purchaseOrder} company={company} />
    </PDFViewer>
  </Box>
</DialogContent>
```

**Line-by-line explanation:**
- **Lines 43-48**: Dialog content with full-size PDF viewer

### 4. PDF Download Buttons
**File**: `src/components/dashboard/inventory/purchase/purchase-pdf/purchase-download-buttons.tsx`

```typescript
"use client";

import React, { useState } from 'react';
import { Button, Stack, CircularProgress } from '@mui/material';
import { Eye, Download } from '@phosphor-icons/react';
import { usePDF } from '@react-pdf/renderer';
import PurchasePDFDoc from './purchase-pdf-doc';
import PurchaseViewDialog from './purchase-view-dialog';
import { PurchaseOrder } from '@/types/purchase.types';
import { CompanyDto } from '@/types/company.types';
```

**Line-by-line explanation:**
- **Lines 1-10**: Import necessary components and hooks for PDF generation

```typescript
interface Props {
  purchaseOrder: PurchaseOrder;
  company: CompanyDto;
}

const PurchaseDownloadButtons: React.FC<Props> = ({ purchaseOrder, company }) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
```

**Line-by-line explanation:**
- **Lines 12-17**: Component props and state for dialog visibility

```typescript
const [instance, updateInstance] = usePDF({
  document: <PurchasePDFDoc purchaseOrder={purchaseOrder} company={company} />
});
```

**Line-by-line explanation:**
- **Lines 19-21**: usePDF hook for generating PDF instance

```typescript
const handleDownload = () => {
  if (instance.url) {
    const link = document.createElement('a');
    link.href = instance.url;
    link.download = `purchase-order-${purchaseOrder.purchase_order_number}.pdf`;
    link.click();
  }
};
```

**Line-by-line explanation:**
- **Lines 23-30**: Download handler creating temporary link element for file download

```typescript
return (
  <Stack direction="row" spacing={1}>
    <Button
      variant="outlined"
      size="small"
      startIcon={<Eye size={16} />}
      onClick={() => setViewDialogOpen(true)}
    >
      View
    </Button>
    
    <Button
      variant="contained"
      size="small"
      startIcon={instance.loading ? <CircularProgress size={16} /> : <Download size={16} />}
      onClick={handleDownload}
      disabled={instance.loading || !instance.url}
    >
      {instance.loading ? 'Generating...' : 'Download'}
    </Button>
    
    <PurchaseViewDialog
      open={viewDialogOpen}
      onClose={() => setViewDialogOpen(false)}
      purchaseOrder={purchaseOrder}
      company={company}
    />
  </Stack>
);
```

**Line-by-line explanation:**
- **Lines 32-54**: Render view and download buttons with loading states and preview dialog

### 5. Purchase History Integration
**File**: `src/components/dashboard/inventory/purchase/purchaseHistory.tsx`

```typescript
import PurchaseDownloadButtons from './purchase-pdf/purchase-download-buttons';
import { CompanyDto } from '@/types/company.types';
```

**Line-by-line explanation:**
- **Lines 1-2**: Import PDF components and company types

```typescript
interface PurchaseHistoryProps {
  orders: any[];
  suppliers: any[];
  onDelete: (id: string) => void;
  company: CompanyDto;
}
```

**Line-by-line explanation:**
- **Lines 4-9**: Add company prop to component interface

```typescript
const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ 
  orders, 
  suppliers, 
  onDelete,
  company 
}) => {
```

**Line-by-line explanation:**
- **Lines 11-17**: Update component to accept company prop

```typescript
<TableCell>
  <Stack direction="row" spacing={1}>
    <IconButton
      size="small"
      color="error"
      onClick={() => onDelete(order.purchase_id)}
    >
      <Trash size={16} />
    </IconButton>
    <PurchaseDownloadButtons
      purchaseOrder={{
        id: order.purchase_id,
        purchase_order_number: order.purchase_order_number || `PO-${order.purchase_id}`,
        supplier_name: getSupplierName(order.supplier_id),
        purchase_created_at: order.purchase_created_at,
        purchase_total_cost: order.purchase_total_cost || 0,
        items: order.items || [],
        notes: order.notes
      }}
      company={company}
    />
  </Stack>
</TableCell>
```

**Line-by-line explanation:**
- **Lines 19-38**: Add PDF download buttons to actions column with mapped purchase data

### 6. Main Page Integration
**File**: `src/app/dashboard/inventory/purchase/page.tsx`

```typescript
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
```

**Line-by-line explanation:**
- **Lines 1-26**: Company object with all required CompanyDto fields including Uganda-specific address structure

## Key Implementation Details

### PDF Generation Pattern
- **usePDF Hook**: Used instead of PDFDownloadLink for better TypeScript compatibility and loading states
- **Component Separation**: PDF document, preview dialog, and download buttons are separate components for reusability
- **Type Safety**: All components use TypeScript interfaces for compile-time error checking

### Company Data Structure
- **CompanyDto Compliance**: Company object includes all required fields from Prisma-generated types
- **Uganda Address Format**: Uses district/county/subcounty/village instead of city/state/zip
- **Nullable Fields**: Properly handles optional fields like tin, phone_number_2, etc.

### Error Handling
- **Loading States**: PDF generation shows loading spinner while processing
- **Disabled States**: Download button disabled until PDF is ready
- **Fallback Data**: Default values provided for missing purchase order data

## Summary

This implementation provides a complete PDF generation system that integrates seamlessly with the existing purchase management interface while maintaining type safety and following established patterns from the quotation system. The system includes:

1. **Type-safe interfaces** for purchase data
2. **Professional PDF document** with company branding
3. **Interactive preview dialog** for viewing PDFs
4. **Download functionality** with loading states
5. **Integration with purchase history** table
6. **Proper error handling** and fallbacks

The code follows React best practices, TypeScript conventions, and maintains consistency with the existing codebase architecture.