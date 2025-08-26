import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerDtoInput } from "../dtos/customer.dto";
import { Customer } from "@prisma/client";

export class CustomerService {
  constructor(private repo: CustomerRepository) {}

  async createCustomer(data: CustomerDtoInput): Promise<Customer> {
    if (data.email) {
      const existing = await this.repo.findByEmail(data.email);
      if (existing) throw new Error("Customer with this email already exists.");
    }
    return this.repo.create(data);
  }

  async getAllCustomers(): Promise<Customer[]> { return this.repo.getAll(); }
  async getCustomerById(id: number): Promise<Customer | null> { return this.repo.getById(id); }
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> { return this.repo.update(id, data); }
  async deleteCustomer(id: number): Promise<Customer> { return this.repo.delete(id); }
}
