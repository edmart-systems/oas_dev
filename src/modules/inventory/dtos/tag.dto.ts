
import { z as zod } from "zod";


export const TagDto = zod.object({
    tag: zod.string(),
    created_by: zod.string().optional(),
    updated_by: zod.string().optional(), 
})


export type TagDtoInput = zod.infer<typeof TagDto>;



