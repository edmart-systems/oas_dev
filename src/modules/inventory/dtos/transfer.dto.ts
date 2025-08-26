import { z } from "zod";

export const TransferItemDto = z.object({
  product_id: z.number(),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export const TransferDto = z.object({
  from_inventory_point_id: z.number().refine((v) => v > 0, "Invalid from inventory point"),
  to_inventory_point_id: z.number().refine((v) => v > 0, "Invalid to inventory point"),
  note: z.string().max(200).optional(),
  items: z.array(TransferItemDto).min(1, "At least one item is required"),
}).refine((data) => data.from_inventory_point_id !== data.to_inventory_point_id, {
  message: "From and To inventory points must be different",
  path: ["to_inventory_point_id"],
});

export type TransferDtoInput = z.infer<typeof TransferDto>;
export type TransferItemDtoInput = z.infer<typeof TransferItemDto>;
