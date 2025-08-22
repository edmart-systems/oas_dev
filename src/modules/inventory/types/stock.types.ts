import { StockDtoInput } from "../dtos/stock.dto";

export interface Stock extends StockDtoInput {
  stock_id: number;
  resulting_stock: number;
  created_at: Date;

  product: {
    product_id: number;
    product_name: string;
  };

  inventory_point: {
    inventory_point_id: number;
    inventory_point: string;
  };
}
