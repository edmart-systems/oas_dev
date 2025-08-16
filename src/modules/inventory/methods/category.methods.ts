import { ObjectVerifyResponse } from "@/types/other.types";
import z from "zod";



export const categorySchema = z.object({
  category: z.string().min(2, "Category name too short."),
});

export interface NewRawCategory  {
    category: string
}

export const validateCategory = (category: NewRawCategory): ObjectVerifyResponse => {
  const result = categorySchema.safeParse(category);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(e => e.message),
    };
  }

  return {
    valid: true,
  };
};  
