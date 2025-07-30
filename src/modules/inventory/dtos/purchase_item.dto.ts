import { z } from "zod";


export const PurchaseItemDto = z.object({
  product_id: z.number(),
  quantity: z.number(),
  unit_cost: z.number(),
  total_cost: z.number().optional(),
});

export type PurchaseItemDtoInput = z.infer<typeof PurchaseItemDto>;