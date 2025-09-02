export interface Product {
  product_id: number;
  product_name: string;
  product_barcode: number;
  sku_code?: string;
  product_description: string;
  unit_id: number;
  category_id: number;
  tag_id: number;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
  vat_inclusive: number;
  created_by: string;
  updated_by: string;
  product_status: number;
  supplier_id?: number;
  reorder_level?: number;
  markup_percentage?: number;
  created_at: Date;
  updated_at: Date;
  unit?: {
    name: string;
  };
  category?: {
    category: string;
  };
  tag?: {
    tag: string;
  };
  supplier?: {
    supplier_name: string;
  };
}



export interface CreateProductRequest {
  product_name: string;
  product_barcode: number;
  sku_code?: string;
  product_description: string;
  unit_id: number;
  category_id: number;
  tag_id: number;
  buying_price: number;
  selling_price: number;
  supplier_id?: number;
  reorder_level?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  product_status?: number;
}