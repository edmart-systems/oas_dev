import { z } from "zod";

export const ProductDto = z.object({
  product_name:        z.string(),
  product_barcode:     z.number(),
  product_description: z.string(),
  product_quantity:    z.number().default(0),
  unit_id:             z.number(),
  category_id:         z.number(),
  tag_id:              z.number(),
  buying_price:        z.number(),
  selling_price:       z.number(),
  vat_inclusive:       z.number().default(0),
  currency_id:         z.number(),
  created_by:          z.string(),
  updated_by:          z.string(),
  product_status:      z.number(),
  supplier_id:         z.number().optional(),
  inventory_point_id:  z.number().default(1), 

});

export const CreateProductDto = z.object({
  product_name:        z.string(),
  product_barcode:     z.number(),
  product_description: z.string(),
  unit_id:             z.number(),
  category_id:         z.number(),
  tag_id:              z.number(),
  buying_price:        z.number(),
  selling_price:       z.number(),
  currency_id:         z.number(),
  created_by:          z.string().optional(),
  updated_by:          z.string().optional(),
  product_status:      z.number(),
  supplier_id:         z.number().optional(), 
  inventory_point_id:  z.number().default(1),

});

export const UpdateProductDto = ProductDto.partial();

export type ProductDtoInput = z.infer<typeof ProductDto>;
export type UpdateProductDtoInput = z.infer<typeof UpdateProductDto>;
export type CreateProductInput = z.infer<typeof CreateProductDto>;
