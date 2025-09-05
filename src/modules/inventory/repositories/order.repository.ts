import { PrismaClient, Order } from "@prisma/client";
import { OrderDtoInput } from "../dtos/order.dto";

export class OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findByNumber(order_number: string) {
    return this.prisma.order.findUnique({ where: { order_number } });
  }

  async create(data: OrderDtoInput & { items_count: number; total_amount: number }) {
    return this.prisma.order.create({
      data: {
        order_number: data.order_number,
        supplier_id: data.supplier_id,
        order_date: data.order_date,
        delivery_date: data.delivery_date,
        status: data.status,
        items_count: data.items_count,
        total_amount: data.total_amount,
        created_by: data.created_by,
        updated_by: data.updated_by,
        items: {
          create: data.items.map((it) => ({
            product_id: it.product_id,
            quantity: it.quantity,
            unit_price: it.unit_price,
            total_price: it.quantity * it.unit_price,
          })),
        },
      },
      include: { items: true, supplier: true },
    });
  }

  async getAll() {
    return this.prisma.order.findMany({
      orderBy: { created_at: "desc" },
      include: { supplier: true, items: true },
    });
  }

  async getById(id: number) {
    return this.prisma.order.findUnique({ where: { order_id: id }, include: { supplier: true, items: true } });
  }

  async update(id: number, data: Partial<Order>) {
    // Items update not handled here for simplicity
    return this.prisma.order.update({ where: { order_id: id }, data });
  }

  async delete(id: number) {
    // delete children first
    await this.prisma.orderItem.deleteMany({ where: { order_id: id } });
    return this.prisma.order.delete({ where: { order_id: id } });
  }
}
