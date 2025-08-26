import { PrismaClient, Transfer, Transfer_item } from "@prisma/client";

export class TransferRepository {
  constructor(private prisma: PrismaClient) {}

  async createTransferDocument(
    from_inventory_point_id: number,
    to_inventory_point_id: number,
    note?: string
  ): Promise<Transfer> {
    return this.prisma.transfer.create({
      data: {
        from_inventory_point_id,
        to_inventory_point_id,
        note,
      },
    });
  }

  async createTransferItems(
    transfer_id: number,
    items: { product_id: number; quantity: number }[]
  ): Promise<Transfer_item[]> {
    const created: Transfer_item[] = [];
    for (const it of items) {
      const row = await this.prisma.transfer_item.create({
        data: { transfer_id, product_id: it.product_id, quantity: it.quantity },
      });
      created.push(row);
    }
    return created;
  }

  async listTransfers() {
    return this.prisma.transfer.findMany({
      orderBy: { created_at: "desc" },
      include: {
        from_point: { select: { inventory_point_id: true, inventory_point: true } },
        to_point: { select: { inventory_point_id: true, inventory_point: true } },
        items: {
          include: { product: { select: { product_id: true, product_name: true } } },
        },
      },
    });
  }
}
