import { Prisma, PrismaClient, Stock } from "@prisma/client";
import { StockDtoInput } from "../dtos/stock.dto";
import { StockRepository } from "../repositories/stock.repository";
import { calculateProductStatus } from "../methods/purchase.method";

export class StockService {
  constructor(
    private prisma: PrismaClient | Prisma.TransactionClient,
    private stockRepo: StockRepository
  ) {}

  async createAndApplyStock(data: Omit<StockDtoInput, "resulting_stock">): Promise<Stock> {
    const { product_id, inventory_point_id, quantity_change } = data;

    const product = await this.prisma.product.findUnique({
      where: { product_id },
      select: {
        product_min_quantity: true,
        product_max_quantity: true,
        product_name: true,
      },
    });
    if (!product) throw new Error(`Product with ID ${product_id} not found.`);

    // Current qty at the specific inventory point
    const invStock = await this.prisma.inventory_stock.findUnique({
      where: {
        product_id_inventory_point_id: {
          product_id,
          inventory_point_id,
        },
      },
    });
    const currentAtPoint = invStock?.quantity ?? 0;
    const resulting_stock = currentAtPoint + quantity_change;

    if (quantity_change < 0 && currentAtPoint < Math.abs(quantity_change)) {
      throw new Error(
        `Insufficient stock at inventory point. Available: ${currentAtPoint}, Required: ${Math.abs(
          quantity_change
        )}`
      );
    }

    // Create stock entry for this point
    const stock = await this.stockRepo.create({
      ...data,
      resulting_stock,
    });

    // Upsert inventory_stock for this point
    await this.prisma.inventory_stock.upsert({
      where: {
        product_id_inventory_point_id: { product_id, inventory_point_id },
      },
      create: {
        product_id,
        inventory_point_id,
        quantity: resulting_stock,
      },
      update: {
        quantity: resulting_stock,
      },
    });

    // Recompute total product quantity across all points and update product status
    const aggregate = await this.prisma.inventory_stock.aggregate({
      where: { product_id },
      _sum: { quantity: true },
    });
    const totalQty = aggregate._sum.quantity ?? 0;
    const newStatus = calculateProductStatus(
      totalQty,
      product.product_min_quantity ?? null,
      product.product_max_quantity ?? null
    );
    await this.prisma.product.update({
      where: { product_id },
      data: { product_quantity: totalQty, product_status: newStatus },
    });

    return stock;
  }

  async getCurrentStock(product_id: number): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { product_id },
      select: { product_quantity: true },
    });
    return product?.product_quantity ?? 0;
  }

  async getAvailableAtPoint(product_id: number, inventory_point_id: number): Promise<number> {
    const row = await this.prisma.inventory_stock.findUnique({
      where: { product_id_inventory_point_id: { product_id, inventory_point_id } },
      select: { quantity: true },
    });
    return row?.quantity ?? 0;
  }

  /**
   * Backfill or rebuild the inventory_stock table by aggregating existing stock entries.
   * Sums quantity_change grouped by (product_id, inventory_point_id) and upserts into inventory_stock.
   * Also recomputes product totals and statuses afterwards.
   */
  async rebuildInventoryStock(): Promise<{ upserts: number }> {
    // 1) Aggregate stock movements per (product, inventory_point)
    const grouped = await (this.prisma as any).stock.groupBy({
      by: ["product_id", "inventory_point_id"],
      _sum: { quantity_change: true },
    });

    let upserts = 0;
    // 2) Upsert each aggregated row into inventory_stock
    for (const row of grouped as Array<{ product_id: number; inventory_point_id: number; _sum: { quantity_change: number | null } }>) {
      const qty = row._sum.quantity_change ?? 0;
      await this.prisma.inventory_stock.upsert({
        where: {
          product_id_inventory_point_id: {
            product_id: row.product_id,
            inventory_point_id: row.inventory_point_id,
          },
        },
        create: {
          product_id: row.product_id,
          inventory_point_id: row.inventory_point_id,
          quantity: qty,
        },
        update: { quantity: qty },
      });
      upserts++;
    }

    // 3) Recompute product totals/status across all points
    const products = await this.prisma.product.findMany({
      select: { product_id: true, product_min_quantity: true, product_max_quantity: true },
    });
    for (const p of products) {
      const aggregate = await this.prisma.inventory_stock.aggregate({
        where: { product_id: p.product_id },
        _sum: { quantity: true },
      });
      const totalQty = aggregate._sum.quantity ?? 0;
      const newStatus = calculateProductStatus(
        totalQty,
        p.product_min_quantity ?? null,
        p.product_max_quantity ?? null
      );
      await this.prisma.product.update({
        where: { product_id: p.product_id },
        data: { product_quantity: totalQty, product_status: newStatus },
      });
    }

    return { upserts };
  }
}
