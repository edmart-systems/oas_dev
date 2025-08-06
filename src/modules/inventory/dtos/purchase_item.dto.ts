import exp from "constants";
import { z } from "zod";


export const PurchaseItemDto = z.object({
  product_id: z.number(),
  quantity: z.number(),
  unit_cost: z.number(),
  total_cost: z.number().optional(),
});
export const CreatePurchaseItemDto = z.object({
  purchase_id: z.number().optional(),
  product_id: z.number(),
  quantity: z.number(),
  unit_cost: z.number(),
  total_cost: z.number().optional(),
});

export const UpdatePurchaseItemDto = PurchaseItemDto.partial();
export type CreatePurchaseItemInput = z.infer<typeof CreatePurchaseItemDto>;  
export type PurchaseItemDtoInput = z.infer<typeof PurchaseItemDto>;