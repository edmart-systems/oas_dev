export interface PurchaseOrderItem {
  po_item_id?: number;
  product_id: number;
  description?: string;
  quantity_ordered: number;
  unit_price: number;
  total_price: number;
  received_qty?: number;
  status?: string;
}

export interface NewPurchaseOrder {
  supplier_id: number;
  currency_id: number;
  expected_delivery?: Date;
  remarks?: string;
  items: PurchaseOrderItem[];
  termsConditions?: {
    validity_days: number;
    validity_words?: string;
    payment_grace_days?: number;
    payment_words?: string;
    vat_percentage?: number;
  };
}

export interface PurchaseOrderFilter {
  status?: string;
  supplier_id?: number;
  requester_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PaginatedPOParams {
  page: number;
  limit: number;
  filter?: PurchaseOrderFilter;
  userId: number;
  isAdmin: boolean;
}

export interface POApprovalAction {
  po_id: number;
  status: 'Approved' | 'Rejected';
  remarks?: string;
}

export interface POStatusUpdate {
  po_id: number;
  status: 'Issued' | 'Cancelled';
}

export interface PurchaseOrderDraftData {
  supplier_id?: number;
  currency_id?: number;
  expected_delivery?: Date;
  remarks?: string;
  items: PurchaseOrderItem[];
  total_amount?: number;
}