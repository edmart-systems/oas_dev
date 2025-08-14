import { z as zod } from "zod";

export const Currency2DtoSchema = zod.object({
  currency_id: zod.number(),
  currency_code: zod.string(),
  currency_name: zod.string(),
});
