import { OrderRepository } from "../repositories/order.repository";
import { OrderDtoInput } from "../dtos/order.dto";
import { Order } from "@prisma/client";

export class OrderService {
  constructor(private repo: OrderRepository) {}

  async createOrder(data: OrderDtoInput) {
    const existing = await this.repo.findByNumber(data.order_number);
    if (existing) throw new Error("Order number already exists.");

    const items_count = data.items?.reduce((acc, it) => acc + it.quantity, 0) ?? 0;
    const total_amount = data.items?.reduce((acc, it) => acc + it.quantity * it.unit_price, 0) ?? 0;

    return this.repo.create({ ...data, items_count, total_amount });
  }

  async getAllOrders() { return this.repo.getAll(); }
  async getOrderById(id: number) { return this.repo.getById(id); }

  async updateOrder(id: number, data: Partial<Order>) { return this.repo.update(id, data); }

  async deleteOrder(id: number) { return this.repo.delete(id); }
}
