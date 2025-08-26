import { PrismaClient, Customer } from "@prisma/client";
import { CustomerDtoInput } from "../dtos/customer.dto";
import { validateCustomer } from "../methods/customer.methods";

export class CustomerRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({ where: { email } });
  }

  async create(data: CustomerDtoInput): Promise<Customer> {
    const validation = validateCustomer(data);
    if (!validation.valid) throw new Error(validation.errors?.join(", ") || "Invalid Customer Input");
    if (data.email) {
      const existing = await this.findByEmail(data.email);
      if (existing) throw new Error("Customer with this email already exists.");
    }
    return this.prisma.customer.create({ data });
  }

  async getAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({ orderBy: { created_at: "desc" } });
  }

  async getById(id: number): Promise<Customer | null> {
    return this.prisma.customer.findUnique({ where: { customer_id: id } });
  }

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    if (data.email) {
      const existing = await this.findByEmail(data.email);
      if (existing && existing.customer_id !== id) throw new Error("Customer with this email already exists.");
    }
    return this.prisma.customer.update({ where: { customer_id: id }, data });
  }

  async delete(id: number): Promise<Customer> {
    return this.prisma.customer.delete({ where: { customer_id: id } });
  }
}
