export interface PurchaseItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface PurchaseOrder {
  purchase_id: number;
  supplier_name: string;
  inventory_point_name: string;
  purchase_created_at: string;
  purchase_items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
}