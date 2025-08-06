export interface Product {
  product_id: number;
  product_name: string;
  product_barcode: number;
  product_description: string;
  product_quantity: number;
  unit_id: number;
  category_id: number;
  tag_id: number;
  buying_price: number;
  selling_price: number;
  vat_inclusive: number;
  currency_id: number;
  created_by: string;
  updated_by: string;
  product_status: number;
  supplier_id?: number;
  inventory_point_id: number;
  product_min_quantity?: number;
  product_max_quantity?: number;
  markup_percentage?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductRequest {
  product_name: string;
  product_barcode: number;
  product_description: string;
  unit_id: number;
  category_id: number;
  tag_id: number;
  buying_price: number;
  selling_price: number;
  currency_id: number;
  supplier_id?: number;
  product_max_quantity?: number;
  product_min_quantity?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  product_quantity?: number;
  product_status?: number;
}