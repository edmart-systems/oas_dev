import { z } from "zod";

export const TransferItemDto = z.object({
  product_id: z.number(),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export const TransferDto = z.object({
  from_location_id: z.number().refine((v) => v > 0, "Invalid from location"),
  to_location_id: z.number().refine((v) => v > 0, "Invalid to location"),
  assigned_user_id: z.number().refine((v) => v > 0, "Invalid assigned user"),
  note: z.string().max(200).optional(),
  items: z.array(TransferItemDto).min(1, "At least one item is required"),
}).refine((data) => data.from_location_id !== data.to_location_id, {
  message: "From and To locations must be different",
  path: ["to_location_id"],
}).superRefine(async (data, ctx) => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  
  try {
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const locationStock = await prisma.location_stock.findFirst({
        where: {
          product_id: item.product_id,
          location_id: data.from_location_id,
        },
      });
      
      const available = locationStock?.quantity ?? 0;
      if (available < item.quantity) {
        const product = await prisma.product.findUnique({
          where: { product_id: item.product_id },
          select: { product_name: true },
        });
        
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Insufficient stock for ${product?.product_name || 'product'}. Available: ${available}, Required: ${item.quantity}`,
          path: ["items", i, "quantity"],
        });
      }
    }
  } finally {
    await prisma.$disconnect();
  }
});

export type TransferDtoInput = z.infer<typeof TransferDto>;
export type TransferItemDtoInput = z.infer<typeof TransferItemDto>;
