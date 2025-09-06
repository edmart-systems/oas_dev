# Purchase Order API Documentation

## Overview
Complete Purchase Order management system with approval workflow, draft handling, email notifications, and PDF generation.

## Database Tables

### Core Tables
- **`purchase_order`** - Main PO records
- **`purchase_order_item`** - PO line items
- **`po_approval`** - Approval workflow records
- **`purchase_order_draft`** - Draft storage (manual/auto)
- **`purchase_order_tcs`** - Terms & conditions

### Related Tables
- **`user`** - Users (requesters, approvers)
- **`supplier`** - Supplier information
- **`product`** - Product catalog
- **`currency`** - Currency definitions
- **`notification`** - In-app notifications

## File Structure

```
src/
├── modules/inventory/
│   ├── types/purchase-order.types.ts          # TypeScript interfaces
│   ├── dtos/purchase-order.dto.ts             # Zod validation schemas
│   ├── repositories/purchase-order.repository.ts  # Database operations
│   └── services/purchase-order.service.ts     # Business logic
├── app/api/inventory/purchase-order/
│   ├── route.ts                               # CRUD operations (GET, POST, PUT)
│   ├── [id]/route.ts                          # Single PO operations
│   ├── approve/route.ts                       # Approval/rejection
│   ├── issue/route.ts                         # Issue PO
│   ├── pdf/route.ts                           # PDF generation
│   ├── send-supplier/route.ts                 # Email to supplier
│   ├── drafts/
│   │   ├── route.ts                           # Draft CRUD
│   │   ├── [draft_id]/route.ts                # Delete single draft
│   │   └── get/[draft_id]/route.ts            # Get single draft
│   └── auto-draft/route.ts                    # Auto-draft management
├── comm/emails/
│   ├── purchase-order.emails.ts               # Email functions
│   └── templates/purchase-order-mail-template.ts  # Email templates
└── utils/pdf/purchase-order-pdf.utils.ts      # PDF generation
```

## API Endpoints

### 1. Create Purchase Order
**POST** `/api/inventory/purchase-order`
```json
{
  "supplier_id": 1,
  "currency_id": 1,
  "expected_delivery": "2024-02-15T00:00:00Z",
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

### 4. Update Purchase Order
**PUT** `/api/inventory/purchase-order`
```json
{
  "po_id": 1,
  "supplier_id": 1,
  "currency_id": 1,
  "items": [...]
}
```

### 5. Approve/Reject Purchase Order
**POST** `/api/inventory/purchase-order/approve`
```json
{
  "po_id": 1,
  "status": "Approved",
  "remarks": "Budget approved"
}
```

### 6. Issue Purchase Order
**POST** `/api/inventory/purchase-order/issue`
```json
{
  "po_id": 1,
  "status": "Issued"
}
```

### 7. Draft Management
- **GET** `/api/inventory/purchase-order/drafts` - Get all drafts
- **POST** `/api/inventory/purchase-order/drafts` - Save draft
- **GET** `/api/inventory/purchase-order/drafts/get/[draft_id]` - Get single draft
- **DELETE** `/api/inventory/purchase-order/drafts/[draft_id]` - Delete draft

### 8. Auto-Draft
- **GET** `/api/inventory/purchase-order/auto-draft` - Get latest auto-draft
- **POST** `/api/inventory/purchase-order/auto-draft` - Save auto-draft
- **DELETE** `/api/inventory/purchase-order/auto-draft` - Delete auto-draft

### 9. PDF Generation
**GET** `/api/inventory/purchase-order/pdf?po_id=1&preview=true`

### 10. Send to Supplier
**POST** `/api/inventory/purchase-order/send-supplier`
```json
{
  "po_id": 1,
  "message": "Please confirm receipt"
}
```

## Business Logic

### PO Lifecycle
1. **Pending** → **Approved** → **Issued** (or **Rejected**)
2. Auto-generated PO numbers: `PO-YYMM-001`
3. Drafts stored separately (manual/auto)

### Approval Workflow
1. **Level 1**: Department (role_id = 2)
2. **Level 2**: Finance (role_id = 4) 
3. **Level 3**: Procurement (role_id = 3)

**Rules:**
- Sequential approval required
- Any rejection stops the process and cancels remaining approvals
- Only pending POs can be edited
- Only approved POs can be issued

### Security & Permissions
- **Requester**: Can create and edit own POs
- **Approvers**: Can approve/reject assigned POs only
- **Procurement (role_id=3)**: Can issue approved POs
- **Admin (role_id=1)**: Full access

### Notifications & Emails
- **PO Created** → First approver (Department)
- **PO Approved** → Next approver in sequence
- **PO Rejected** → Requester only (process stops)
- **PO Fully Approved** → Procurement team
- **PO Issued** → All stakeholders + supplier (with PDF)

### Data Security
- Confidential user data excluded from API responses
- Only necessary fields returned using Prisma `select`
- Email addresses only used for notifications

## Database Schema

### purchase_order
```sql
po_id (PK), po_number, supplier_id (FK), requester_id (FK), 
status, total_amount, currency_id (FK), expected_delivery, 
issued_date, approval_date, remarks, created_at, updated_at
```

### purchase_order_item
```sql
po_item_id (PK), po_id (FK), product_id (FK), description,
quantity_ordered, unit_price, total_price, received_qty, 
status, created_at, updated_at
```

### po_approval
```sql
approval_id (PK), po_id (FK), approver_id (FK), level,
status, remarks, approved_at, created_at, updated_at
```

### purchase_order_draft
```sql
draft_id (PK), creator_id (FK), draft_data (JSON), draft_type,
supplier_id (FK), total_amount, currency, expected_delivery,
remarks, created_at, updated_at
```

### purchase_order_tcs
```sql
po_tc_id (PK), po_id (FK), validity_days, validity_words,
payment_grace_days, payment_words, vat_percentage,
created_at, updated_at
```

## Error Handling
- Validation errors return field-specific messages
- Business rule violations return descriptive errors
- Email failures are logged but don't break operations
- PDF generation errors return 500 status

## Features
✅ Complete CRUD operations
✅ Multi-level approval workflow
✅ Draft management (manual + auto)
✅ Email notifications
✅ PDF generation and preview
✅ Supplier email delivery
✅ Pagination and filtering
✅ Role-based security
✅ Data privacy protection
✅ Comprehensive error handling