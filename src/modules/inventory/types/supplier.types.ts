import { SupplierDtoInput } from "../dtos/supplier.dto";

export interface Supplier extends SupplierDtoInput{
    supplier_id: number;
    id: number;
    name: string;
    created_at: Date;
}

