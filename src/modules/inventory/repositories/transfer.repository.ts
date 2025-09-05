import { PrismaClient, Transfer, Transfer_item } from "@prisma/client";

export class TransferRepository {
  constructor(private prisma: PrismaClient) {}

  async createTransferDocument(
    from_location_id: number,
    to_location_id: number,
    assigned_user_id: number,
    created_by: string,
    note?: string
  ): Promise<Transfer> {
    return this.prisma.transfer.create({
      data: {
        from_location_id,
        to_location_id,
        assigned_user_id,
        created_by,
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
        from_location: { select: { location_id: true, location_name: true } },
        to_location: { select: { location_id: true, location_name: true } },
        assigned_user: { select: { userId: true, firstName: true, lastName: true } },
        creator: { select: { co_user_id: true, firstName: true, lastName: true } },
        items: {
          include: { product: { select: { product_id: true, product_name: true } } },
        },
      },
    });
  }
}
