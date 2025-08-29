// src/dtos/inventoryStock.dto.ts

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
  inventory_point_id: number;
  inventory_point: string;
  stock: ProductStockDto[];
}
