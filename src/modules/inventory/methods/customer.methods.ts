import { CustomerDtoInput } from "../dtos/customer.dto";
import { ObjectVerifyResponse } from "@/types/other.types";
import z from "zod";

const customerSchema = z.object({
  name: z.string().min(2, "Customer name too short."),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export const validateCustomer = (customer: CustomerDtoInput): ObjectVerifyResponse => {
  const result = customerSchema.safeParse(customer);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((e) => e.message),
    };
  }
  return { valid: true };
};
