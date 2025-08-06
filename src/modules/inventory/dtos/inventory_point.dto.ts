
import { z as zod } from "zod";


export const Inventory_pointDto = zod.object({
    inventory_point: zod.string(),
    created_by: zod.string().optional(),
    updated_by: zod.string().optional(), 
})


export type Inventory_pointDtoInput = zod.infer<typeof Inventory_pointDto>;



