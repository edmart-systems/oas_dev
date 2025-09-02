import { CreateProductInput } from "../dtos/product.dto";
import { ObjectVerifyResponse } from "@/types/other.types";
import z from "zod";



const productSchema = z.object({
    product_name: z.string().min(6, "Product name too short."),
    product_barcode: z.number(),
    sku_code: z.string().optional(),
    product_description: z.string(),
    unit_id: z.number(),
    category_id: z.number(),
    tag_id: z.number(),
    buying_price: z.number(),
    selling_price: z.number(),
    created_by: z.string().optional(),
    updated_by: z.string().optional(),
    supplier_id: z.number().nullable().optional(),
    reorder_level: z.number().nullable().optional(),
    update_at: z.date().optional()
})  



export const validateProduct = (product: CreateProductInput): ObjectVerifyResponse => {
    const result = productSchema.safeParse(product);

    if (!result.success) {
        return {
            valid: false,
            errors: result.error.errors.map(e => e.message),
        }
    }

    return {
        valid: true,
    }
}


export const calculateProductStatus = (
  currentQuantity: number,
  minQuantity: number | null,
  maxQuantity: number | null
): number => {
  if (!minQuantity || !maxQuantity) return 1;
  
  if (currentQuantity <= minQuantity) return 1; // Low
  if (currentQuantity >= maxQuantity) return 3; // High
  return 2;
};

export const calculateMarkupPercentage = (
  buyingPrice: number,
  sellingPrice: number
): number => {
  if (buyingPrice === 0) return 0;
  return Math.round(((sellingPrice - buyingPrice) / buyingPrice) * 100);
};