import { z as zod } from "zod";


export const CategoryDto = zod.object({
    category: zod.string(),
    created_by: zod.string().optional(),
    updated_by: zod.string().optional(), 
})


export type CategoryDtoInput = zod.infer<typeof CategoryDto>;



