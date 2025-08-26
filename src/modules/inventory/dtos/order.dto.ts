import { z } from "zod";

export const OrderItemDto = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unit_price: z.number().int().nonnegative(),
});

export const OrderDto = z.object({
  order_number: z.string(),
  supplier_id: z.number().int().positive(),
  order_date: z.coerce.date().optional(),
  delivery_date: z.coerce.date().optional(),
  status: z.enum(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]).default("Pending"),
  items: z.array(OrderItemDto).default([]),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export const UpdateOrderDto = OrderDto.partial();

export type OrderItemDtoInput = z.infer<typeof OrderItemDto>;
export type OrderDtoInput = z.infer<typeof OrderDto>;
export type UpdateOrderDtoInput = z.infer<typeof UpdateOrderDto>;
