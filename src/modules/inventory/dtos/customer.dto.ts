import { z } from "zod";

export const CustomerDto = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export const UpdateCustomerDto = CustomerDto.partial();

export type CustomerDtoInput = z.infer<typeof CustomerDto>;
export type UpdateCustomerDtoInput = z.infer<typeof UpdateCustomerDto>;
