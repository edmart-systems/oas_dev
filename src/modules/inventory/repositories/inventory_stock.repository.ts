import { PrismaClient } from "@prisma/client";

export class InventoryStockRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll() {
    return this.prisma.inventory_stock.findMany({
      orderBy: { inventory_point_id: "asc" },
      include: {
        product: { select: { product_id: true, product_name: true } },
        inventory_point: { select: { inventory_point_id: true, inventory_point: true } },
      },
    });
  }
}
