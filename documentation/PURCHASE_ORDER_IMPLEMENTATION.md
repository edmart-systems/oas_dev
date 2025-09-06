# Purchase Order API Implementation

## Overview
Complete Purchase Order API implementation following the same patterns as Inventory and Quotation modules, with draft handling, email notifications, and PDF generation.

## File Structure

### Types & DTOs
- `src/modules/inventory/types/purchase-order.types.ts` - TypeScript interfaces
- `src/modules/inventory/dtos/purchase-order.dto.ts` - Zod validation schemas

### Repository & Service
- `src/modules/inventory/repositories/purchase-order.repository.ts` - Database operations
- `src/modules/inventory/services/purchase-order.service.ts` - Business logic with notifications

### API Endpoints
- `src/app/api/inventory/purchase-order/route.ts` - Main CRUD operations
- `src/app/api/inventory/purchase-order/[id]/route.ts` - Individual PO operations
- `src/app/api/inventory/purchase-order/approve/route.ts` - Approval/rejection
- `src/app/api/inventory/purchase-order/issue/route.ts` - Issue PO (procurement only)
- `src/app/api/inventory/purchase-order/drafts/route.ts` - Draft management
- `src/app/api/inventory/purchase-order/drafts/[draft_id]/route.ts` - Individual draft operations
- `src/app/api/inventory/purchase-order/auto-draft/route.ts` - Auto-draft functionality
- `src/app/api/inventory/purchase-order/pdf/route.ts` - PDF generation
- `src/app/api/inventory/purchase-order/send-supplier/route.ts` - Send PO to supplier

### Email & PDF
- `src/comm/emails/templates/purchase-order-mail-template.ts` - Email templates
- `src/comm/emails/purchase-order.emails.ts` - Email service functions
- `src/utils/pdf/purchase-order-pdf.utils.ts` - PDF generation utility

## API Endpoints

### 1. Create Purchase Order
**POST** `/api/inventory/purchase-order`
```json
{
  "supplier_id": 1,
  "currency_id": 1,
  "expected_delivery": "2024-01-15T00:00:00Z",
  "remarks": "Urgent order",
  "items": [
    {
      "product_id": 1,
      "description": "Office supplies",
      "quantity_ordered": 10,
      "unit_price": 25.50,
      "total_price": 255.00
    }
  ],
  "termsConditions": {
    "validity_days": 30,
    "payment_grace_days": 15,
    "vat_percentage": 18
  }
}
```

### 2. Get Purchase Orders (Paginated)
**GET** `/api/inventory/purchase-order?page=1&limit=10&status=Pending&supplier_id=1`

### 3. Get Single Purchase Order
**GET** `/api/inventory/purchase-order/[id]`

### 4. Approve/Reject Purchase Order
**POST** `/api/inventory/purchase-order/approve`
```json
{
  "po_id": 1,
  "status": "Approved",
  "remarks": "Approved for procurement"
}
```

### 5. Issue Purchase Order
**POST** `/api/inventory/purchase-order/issue`
```json
{
  "po_id": 1,
  "status": "Issued"
}
```

### 6. Draft Management
**GET** `/api/inventory/purchase-order/drafts` - Get all drafts
**POST** `/api/inventory/purchase-order/drafts` - Save draft
**DELETE** `/api/inventory/purchase-order/drafts` - Delete all drafts
**DELETE** `/api/inventory/purchase-order/drafts/[draft_id]` - Delete specific draft

### 7. Auto-Draft
**GET** `/api/inventory/purchase-order/auto-draft` - Get latest auto-draft
**POST** `/api/inventory/purchase-order/auto-draft` - Save auto-draft
**DELETE** `/api/inventory/purchase-order/auto-draft` - Delete auto-draft

### 8. PDF Generation
**GET** `/api/inventory/purchase-order/pdf?po_id=1&preview=true`

### 9. Send to Supplier
**POST** `/api/inventory/purchase-order/send-supplier`
```json
{
  "po_id": 1,
  "message": "Please confirm receipt"
}
```

## Business Logic Implementation

### PO Lifecycle
1. **Pending** → **Approved** → **Issued** (or **Rejected**)
2. Drafts stored in `PurchaseOrderDraft` table
3. Auto-generated PO numbers: `PO-YYMM-001`
4. Level-based approval system

### Security & Permissions
- **Requester**: Can create POs
- **Approver**: Can approve/reject assigned POs only
- **Procurement**: Can issue approved POs and send to suppliers
- **Admin**: Full access

### Notifications & Emails
- **PO Created** → First approver (in-app + email)
- **PO Approved** → Next approver or procurement team
- **PO Rejected** → Requester (in-app + email)
- **PO Issued** → All stakeholders (in-app + email to supplier with PDF)

### Draft Handling
- Manual drafts (max 10 per user)
- Auto-drafts (1 per user, auto-replaced)
- Same pattern as Quotation module

### PDF Features
- Professional PO layout
- Company branding
- Item details with totals
- Terms & conditions
- Status indicators
- Preview and download options

## Key Features Implemented

✅ **Complete CRUD Operations**
✅ **Pagination & Filtering** (status, supplier, requester, date ranges)
✅ **Draft Management** (manual + auto-drafts)
✅ **Approval Workflow** (level-based)
✅ **Email Notifications** (all lifecycle events)
✅ **PDF Generation** (professional layout)
✅ **Send to Supplier** (email with PDF attachment)
✅ **Security & Role-based Access**
✅ **Business Rule Validation**
✅ **Error Handling & Logging**

## Dependencies Required

Add to `package.json`:
```json
{
  "puppeteer": "^21.0.0",
  "nodemailer": "^6.9.0",
  "@types/nodemailer": "^6.4.0"
}
```

## Environment Variables

Add to `.env`:
```
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourcompany.com
```

## Usage Examples

### Frontend Integration
```typescript
// Create PO
const createPO = async (poData) => {
  const response = await fetch('/api/inventory/purchase-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(poData)
  });
  return response.json();
};

// Get POs with filters
const getPOs = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/inventory/purchase-order?${params}`);
  return response.json();
};

// Download PDF
const downloadPDF = (poId) => {
  window.open(`/api/inventory/purchase-order/pdf?po_id=${poId}&preview=false`);
};
```

This implementation provides a complete Purchase Order management system following the established patterns in the codebase, with full lifecycle management, notifications, and document generation capabilities.