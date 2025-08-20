import { Inventory_pointDtoInput } from "../dtos/inventory_point.dto";




export interface InventoryPoint extends Inventory_pointDtoInput {
    inventory_point_id: number;
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
    creator:{
        firstName: string;
        lastName: string;
    }
}