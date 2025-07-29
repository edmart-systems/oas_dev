import { z } from "zod";

export const PurchaseDto = z.object({
  purchase_quantity: z.number(),
  purchase_unit_cost: z.number(),
  purchase_total_cost: z.number(),
  inventory_point_id: z.number().default(1),
  supplier_id: z.number(),
  purchase_created_by: z.string().optional(),
  purchase_updated_by: z.string().optional(),
});
export const CreatePurchaseDto = z.object({
  purchase_quantity: z.number(),
  purchase_unit_cost: z.number(),
  purchase_total_cost: z.number().optional(),
  inventory_point_id: z.number().default(1),
  supplier_id: z.number(),
  purchase_created_by: z.string().optional(),
  purchase_updated_by: z.string().optional(),
});

export const UpdatePurchaseDto = PurchaseDto.partial();
export type PurchaseDtoInput = z.infer<typeof PurchaseDto>;
export type CreatePurchaseInput = z.infer<typeof CreatePurchaseDto>;