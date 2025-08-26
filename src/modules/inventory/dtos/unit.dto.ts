import { z as zod } from "zod";

export const UnitDto = zod.object({
  name: zod.string().min(1, "Unit name is required"),
  short_name: zod.string().min(1, "Short name is required"),
  unit_desc: zod.string().optional(),
  updated_at: zod.date().optional(),
});

export type UnitDtoInput = zod.infer<typeof UnitDto>;
