import { z } from "zod";

export const SaleItemDto = z.object({
  product_id: z.number(),
  quantity: z.number(),
  unit_price: z.number(),
  discount: z.number().optional().default(0),
  tax: z.number().optional().default(0),
  total_price: z.number().optional(), 
});

export const SaleDto = z.object({
  sale_no: z.string().max(12),
  seller_id: z.number(),
  currency_id: z.number(),
  sale_items: z.array(SaleItemDto),
  sale_total_amount: z.number().optional(),
  sale_total_discount: z.number().optional(),
  sale_total_tax: z.number().optional(),
  sale_net_amount: z.number().optional(),
  sale_grand_total: z.number().optional(),
  inventory_point_id: z.number().default(1),
});

export const CreateSaleDto = z.object({
  sale_no: z.string().max(12),
  seller_id: z.number(),
  currency_id: z.number(),
  sale_items: z.array(SaleItemDto),
  sale_total_amount: z.number().optional(),
  sale_total_discount: z.number().optional(),
  sale_total_tax: z.number().optional(),
  sale_net_amount: z.number().optional(),
  sale_grand_total: z.number().optional(),
  inventory_point_id: z.number().default(1),
  
});

export type SaleItemInput = z.infer<typeof SaleItemDto>;
export type CreateSaleInput = z.infer<typeof CreateSaleDto>;
