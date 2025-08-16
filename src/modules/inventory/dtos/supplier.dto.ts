import { create, update } from "lodash";
import { z } from "zod";

export const SupplierDto = z.object({
    supplier_name:       z.string(),
    supplier_phone:      z.string().optional(),
    supplier_address:   z.string().optional(),
    supplier_email:      z.string(),
    supplier_tinNumber: z.number().optional(),
    created_by: z.string().optional(),
    updated_by: z.string().optional(),
    updated_at: z.date().optional(),
});




export const UpdateSupplierDto = SupplierDto.partial();

export type UpdateSupplierDtoInput = z.infer<typeof UpdateSupplierDto>; 


export type SupplierDtoInput = z.infer<typeof SupplierDto>;