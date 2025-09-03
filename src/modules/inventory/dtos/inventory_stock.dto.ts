
export interface ProductStockDto {
  product_id: number;
  product_name: string;
  barcode: number;
  supplier?: string;
  category: string;
  tag: string;
  unit: string;
  quantity: number;
}

export interface InventoryStockDto {
  location_id: number;
  location_name: string;
  stock: ProductStockDto[];
}
