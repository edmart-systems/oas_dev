import { z } from "zod";
import { PurchaseItemDto } from "./purchase_item.dto";

export const PurchaseDto = z.object({
  purchase_quantity: z.number().optional(),
  purchase_unit_cost: z.number().optional(),
  purchase_total_cost: z.number().optional(),
  inventory_point_id: z.number().default(1),
  supplier_id: z.number(),
  purchase_created_by: z.string().optional(),
  purchase_updated_by: z.string().optional(),
  purchase_items: z.array(PurchaseItemDto),
});

export const CreatePurchaseDto = z.object({
  purchase_quantity: z.number().optional(),
  purchase_unit_cost: z.number().optional(),
  purchase_total_cost: z.number().optional(),
  inventory_point_id: z.number().default(1),
  supplier_id: z.number(),
  purchase_created_by: z.string().optional(),
  purchase_updated_by: z.string().optional(),
  purchase_items: z.array(PurchaseItemDto),
});

export const UpdatePurchaseDto = PurchaseDto.partial();
export type PurchaseDtoInput = z.infer<typeof PurchaseDto>;
export type CreatePurchaseInput = z.infer<typeof CreatePurchaseDto>;