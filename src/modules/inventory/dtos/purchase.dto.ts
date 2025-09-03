import { z } from "zod";
import { PurchaseItemDto } from "./purchase_item.dto";
import { update } from "lodash";

export const PurchaseDto = z.object({
  purchase_quantity: z.number().optional(),
  purchase_unit_cost: z.number().optional(),
  purchase_total_cost: z.number().optional(),
  location_id: z.number(),
  supplier_id: z.number(),
  purchase_created_by: z.string().optional(),
  purchase_updated_by: z.string().optional(),
  purchase_created_at: z.date().optional(),
  purchase_updated_at: z.date().optional(),
  purchase_items: z.array(PurchaseItemDto),
  update_at: z.date().optional()
});


export const CreatePurchaseDto = z.object({
  purchase_quantity: z.number().optional(),
  purchase_unit_cost: z.number().optional(),
  purchase_total_cost: z.number().optional(),
  location_id: z.number().default(1),
  supplier_id: z.number(),
  purchase_created_by: z.string().optional(),
  purchase_updated_by: z.string().optional(),
  purchase_created_at: z.date().optional(),
  purchase_updated_at: z.date().optional(),
  purchase_items: z.array(PurchaseItemDto),
  update_at: z.date().optional()
});

export const UpdatePurchaseDto = PurchaseDto.partial();
export type PurchaseDtoInput = z.infer<typeof PurchaseDto>;
export type CreatePurchaseInput = z.infer<typeof CreatePurchaseDto>;