import { StockDtoInput } from "../dtos/stock.dto";

export interface Stock {
  stock_id?: number;
  location_stock_id?: number;
  product_id: number;
  location_id: number;
  change_type: "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT" | "TRANSFER";
  quantity_change: number;
  resulting_stock?: number;
  reference_id?: number;
  quantity?: number;
  status?: string;
  created_at?: Date;

  product?: {
    product_id: number;
    product_name: string;
    sku_code?: string;
    reorder_level?: number;
    product_updated_at?: string;
  };

  inventory_point?: {
    inventory_point_id: number;
    inventory_point: string;
  };

  location?: {
    location_id: number;
    location_name: string;
  };
}
