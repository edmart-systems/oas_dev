import { ObjectVerifyResponse } from "@/types/other.types";
import z from "zod";

export const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  short_name: z.string().min(1, "Short name is required"),
  unit_desc: z.string().optional(),
});

export type NewRawUnit = z.infer<typeof unitSchema>;

export const validateUnit = (unit: NewRawUnit): ObjectVerifyResponse => {
  const result = unitSchema.safeParse(unit);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((e) => e.message),
    };
  }
  return { valid: true };
};
