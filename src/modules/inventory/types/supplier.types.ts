import { SupplierDtoInput } from "../dtos/supplier.dto";

export interface Supplier extends SupplierDtoInput{
    supplier_id: number;
    created_at: Date;
}