import { z } from "zod";

export const StockDto = z.object({
  product_id: z.number(),
  inventory_point_id: z.number(),
  change_type: z.enum(["PURCHASE", "SALE", "RETURN", "ADJUSTMENT", "TRANSFER"]).default("ADJUSTMENT"),
  quantity_change: z
    .number()
    .int()
    .refine((val) => val !== 0, "Quantity change cannot be zero"),
  resulting_stock: z.number().min(0, "Resulting stock cannot be negative"),
  reference_id: z.number().optional(),
});

export type StockDtoInput = z.infer<typeof StockDto>;
