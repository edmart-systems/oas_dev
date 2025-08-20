import { SupplierDtoInput } from "../dtos/supplier.dto";
import { ObjectVerifyResponse } from "@/types/other.types";
import z from "zod";



const supplierSchema = z.object({
    supplier_name: z.string().min(6, "Supplier name too short."),
    supplier_phone: z.string().optional(),
    supplier_address: z.string().optional(),
    supplier_email: z.string().email("Invalid email address."),
    supplier_tinNumber: z.number().optional(),
    created_by: z.string().optional(),
    updated_by: z.string().optional(),
    updated_at: z.date().optional(),
})


export const validateSupplier = (supplier: SupplierDtoInput): ObjectVerifyResponse => {
    const result = supplierSchema.safeParse(supplier);

    if (!result.success) {
        return {
            valid: false,
            errors: result.error.errors.map(e => e.message),
        }
    }

    return {
        valid: true,
    }
}