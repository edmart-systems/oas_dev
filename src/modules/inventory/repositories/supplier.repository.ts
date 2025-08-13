import { PrismaClient } from "@prisma/client";
import { supplier } from "@prisma/client";
import { SupplierDtoInput } from "../dtos/supplier.dto";



export class SupplierRepository {
  constructor(private prisma: PrismaClient) {}

  async findByName(supplier_name: string): Promise<supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { supplier_name },
    });
  }

  async findByEmail(supplier_email: string): Promise<supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { supplier_email },
    });
  }

  async create(data: SupplierDtoInput): Promise<supplier> {
    const existing = await this.findByEmail(data.supplier_email);
    if (existing) {
      throw new Error("Supplier with this email already exists.");
    }

    return this.prisma.supplier.create({ data });
  }

  async getAll(): Promise<supplier[]> {
    return this.prisma.supplier.findMany({
      orderBy: { supplier_created_at: "desc" },
    });
  }

  async getById(id: number): Promise<supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { supplier_id: id },
    });
  }

  async update(id: number, data: Partial<supplier>): Promise<supplier> {
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