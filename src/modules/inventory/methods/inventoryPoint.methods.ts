import { ObjectVerifyResponse } from "@/types/other.types";
import z from "zod";
import { Inventory_pointDtoInput } from "../dtos/inventory_point.dto";


export const inventoryPointSchema = z.object({
    inventory_point: z.string().min(2, "Inventory point name too short."),
})

export const validateInventoryPoint = (inventoryPoint: Inventory_pointDtoInput): ObjectVerifyResponse => {
    const result = inventoryPointSchema.safeParse(inventoryPoint);

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

