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
  seller_id: z.number().optional(),
  seller_co_user_id: z.string().optional(),
  currency_id: z.number(),
  sale_items: z.array(SaleItemDto),
  sale_total_quantity: z.number().optional(),
  sale_total_amount: z.number().optional(),
  sale_total_discount: z.number().optional(),
  sale_total_tax: z.number().optional(),
  sale_net_amount: z.number().optional(),
  sale_grand_total: z.number().optional(),
  inventory_point_id: z.number().default(1),
}).superRefine((val, ctx) => {
  if (val.seller_id == null && !val.seller_co_user_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide either seller_id or seller_co_user_id",
      path: ["seller_id"],
    });
  }
});

export const CreateSaleDto = z.object({
  sale_no: z.string().max(12),
  seller_id: z.number().optional(),
  seller_co_user_id: z.string().optional(),
  currency_id: z.number(),
  sale_items: z.array(SaleItemDto),
  sale_total_quantity: z.number().optional(),
  sale_total_amount: z.number().optional(),
  sale_total_discount: z.number().optional(),
  sale_total_tax: z.number().optional(),
  sale_net_amount: z.number().optional(),
  sale_grand_total: z.number().optional(),
  inventory_point_id: z.number().default(1),
  
}).superRefine((val, ctx) => {
  if (val.seller_id == null && !val.seller_co_user_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide either seller_id or seller_co_user_id",
      path: ["seller_id"],
    });
  }
});

export type SaleItemInput = z.infer<typeof SaleItemDto>;
export type CreateSaleInput = z.infer<typeof CreateSaleDto>;
