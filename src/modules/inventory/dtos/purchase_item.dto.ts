import { z } from "zod";


export const PurchaseItemDto = z.object({
  purchase_item_id: z.number().optional(),
  purchase_id: z.number(),
  product_id: z.number(),
  quantity: z.number(),
  unit_cost: z.number(),
  total_cost: z.number().optional(),
});

export type PurchaseItemDtoInput = z.infer<typeof PurchaseItemDto>;