import { SupplierRepository } from "../repositories/supplier.repository";
import { SupplierDtoInput } from "../dtos/supplier.dto";
import { supplier } from "@prisma/client";


export class SupplierService {
  constructor(private supplierRepo: SupplierRepository) {}

  async createSupplier(data: SupplierDtoInput): Promise<supplier> {
    const existingEmail = await this.supplierRepo.findByEmail(data.supplier_email);
    if (existingEmail) {
      throw new Error("Supplier with this email already exists.");
    }

    const existingName = await this.supplierRepo.findByName(data.supplier_name);
    if (existingName) {
      throw new Error("Supplier with this name already exists.");
    }

    return this.supplierRepo.create(data);
  }

  async getAllSuppliers(): Promise<supplier[]> {
    return this.supplierRepo.getAll();
  }

  async getSupplierById(id: number): Promise<supplier | null> {
    return this.supplierRepo.getById(id);
  }

  async updateSupplier(id: number, data: Partial<supplier>): Promise<supplier> {
    const existing = await this.supplierRepo.getById(id);
    if (!existing) throw new Error("Supplier not found");

    if (data.supplier_email) {
      const existingEmail = await this.supplierRepo.findByEmail(data.supplier_email);
      if (existingEmail && existingEmail.supplier_id !== id) {
        throw new Error("A supplier with this email already exists.");
      }
    }

    if (data.supplier_name) {
      const existingName = await this.supplierRepo.findByName(data.supplier_name);
      if (existingName && existingName.supplier_id !== id) {
        throw new Error("A supplier with this name already exists.");
      }
    }

    return this.supplierRepo.update(id, data);
  }

//   async deleteSupplier(id: number): Promise<Supplier> {
//     const existing = await this.supplierRepo.getById(id);
//     if (!existing) throw new Error("Supplier not found");
//     return this.supplierRepo.delete(id);
//   }
}