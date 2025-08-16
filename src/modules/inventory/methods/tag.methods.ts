import { ObjectVerifyResponse } from "@/types/other.types";
import z from "zod";


export const tagSchema = z.object({
  tag: z.string().min(2, "Tag name too short."),
});


export interface NewRawTag  {
    tag: string
}


export const validateTag = (tag: NewRawTag): ObjectVerifyResponse => {
  const result = tagSchema.safeParse(tag);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(e => e.message),
    };
  }

  // ✅ Success case
  return {
    valid: true,
  };
};