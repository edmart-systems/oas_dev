import { PrismaClient } from "@prisma/client";
import { Supplier } from "@prisma/client";
import { SupplierDtoInput } from "../dtos/supplier.dto";
import { validateSupplier } from "../methods/supplier.methods";



export class SupplierRepository {
  constructor(private prisma: PrismaClient) {}

  async findByName(supplier_name: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { supplier_name },
    });
  }

  async findByEmail(supplier_email: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { supplier_email },
    });
  }

  async create(data: SupplierDtoInput): Promise<Supplier> {
    const validation = validateSupplier(data);
            if(!validation.valid){
                throw new Error(validation.errors?.join(", ") || "Invalid Inventory Point Input");  
            }
    
    const existing = await this.findByEmail(data.supplier_email);
    if (existing) {
      throw new Error("Supplier with this email already exists.");
    }

    return this.prisma.supplier.create({ data });
  }

  async getAll(): Promise<Supplier[]> {
    return this.prisma.supplier.findMany({
      orderBy: { supplier_created_at: "desc" },
    });
  }

  async getById(id: number): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { supplier_id: id },
    });
  }

  async update(id: number, data: Partial<Supplier>): Promise<Supplier> {

    if (data.supplier_email) {
      const existing = await this.findByEmail(data.supplier_email);
      if (existing && existing.supplier_id !== id) {
        throw new Error("Supplier with this email already exists.");
      }
    }

    if (data.supplier_name) {
      const existing = await this.findByName(data.supplier_name);
      if (existing && existing.supplier_id !== id) {
        throw new Error("Supplier with this name already exists.");
      }
    }

    return this.prisma.supplier.update({
      where: { supplier_id: id },
      data,
    });
  }
}