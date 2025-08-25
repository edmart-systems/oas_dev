import { z } from "zod";

export const StockDto = z.object({
  product_id: z.number(),
  inventory_point_id: z.number(),
  change_type: z.enum(["PURCHASE", "SALE", "RETURN", "ADJUSTMENT"]).default("ADJUSTMENT"),
  quantity_change: z.number().min(1, "Quantity must be at least 1"),
  resulting_stock: z.number().min(0, "Resulting stock cannot be negative"),
  reference_id: z.number().optional(),
});

export type StockDtoInput = z.infer<typeof StockDto>;
