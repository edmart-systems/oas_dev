import { PrismaClient, sale_item } from "@prisma/client";
import { SaleItemInput } from "../dtos/sale.dto";

export class SaleItemRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: SaleItemInput & { sale_id: number; total_price: number }): Promise<sale_item> {
    return this.prisma.sale_item.create({ data });
  }
}
