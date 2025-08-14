import { z as zod } from "zod";

export const BankDtoSchema = zod.object({
  name: zod.string(),
  bank_id: zod.number(),
  co_id: zod.number(),
  branch_name: zod.string(),
  swift_code: zod.string().nullable(),
  ac_title: zod.string(),
  ac_number: zod.string(),
});
