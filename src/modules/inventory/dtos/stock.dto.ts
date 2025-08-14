import { z } from "zod";

export const StockDto = z.object({
  product_id: z.number(),
  inventory_point_id: z.number(),
  change_type: z.enum(["PURCHASE", "SALE", "RETURN", "ADJUSTMENT"]), // restrict to allowed values
  quantity_change: z.number(),
  resulting_stock: z.number(),
  reference_id: z.number().optional(),
});



export type StockDtoInput = z.infer<typeof StockDto>;
