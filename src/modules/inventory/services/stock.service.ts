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
    const { product_id, location_id, quantity_change } = data;

    const product = await this.prisma.product.findUnique({
      where: { product_id },
      select: {
        reorder_level: true,
        product_name: true,
        stock_quantity: true,
      },
    });
    if (!product) throw new Error(`Product with ID ${product_id} not found.`);

    // Current qty at the specific location
    const locationStock = await this.prisma.location_stock.findFirst({
      where: {
        product_id,
        location_id,
      },
    });
    const currentAtLocation = locationStock?.quantity ?? 0;
    const resulting_stock = currentAtLocation + quantity_change;

    if (quantity_change < 0 && currentAtLocation < Math.abs(quantity_change)) {
      throw new Error(
        `Insufficient stock at location. Available: ${currentAtLocation}, Required: ${Math.abs(
          quantity_change
        )}`
      );
    }

    // Create stock entry for this location
    const stock = await this.stockRepo.create({
      ...data,
      resulting_stock,
    });

    // Upsert location_stock for this location
    const existing = await this.prisma.location_stock.findFirst({
      where: { product_id, location_id },
    });
    
    if (existing) {
      await this.prisma.location_stock.update({
        where: { location_stock_id: existing.location_stock_id },
        data: { quantity: resulting_stock },
      });
    } else {
      await this.prisma.location_stock.create({
        data: {
          product_id,
          location_id,
          quantity: resulting_stock,
        },
      });
    }

    // Recompute total product quantity across all locations
    const aggregate = await this.prisma.location_stock.aggregate({
      where: { product_id },
      _sum: { quantity: true },
    });
    const totalQty = aggregate._sum.quantity ?? 0;
    
    await this.prisma.product.update({
      where: { product_id },
      data: { stock_quantity: totalQty },
    });

    return stock;
  }

  async getCurrentStock(product_id: number): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { product_id },
      select: { stock_quantity: true },
    });
    return product?.stock_quantity ?? 0;
  }

  async getAvailableAtLocation(product_id: number, location_id: number): Promise<number> {
    const row = await this.prisma.location_stock.findFirst({
      where: { product_id, location_id },
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
      by: ["product_id", "location_id"],
      _sum: { quantity_change: true },
    });

    let upserts = 0;
    // 2) Upsert each aggregated row into inventory_stock
    for (const row of grouped as Array<{ product_id: number; location_id: number; _sum: { quantity_change: number | null } }>) {
      const qty = row._sum.quantity_change ?? 0;
      await this.prisma.location_stock.upsert({
        where: {
          product_id_location_id: {
            product_id: row.product_id,
            location_id: row.location_id,
          },
        },
        create: {
          product_id: row.product_id,
          location_id: row.location_id,
          quantity: qty,
        },
        update: { quantity: qty },
      });
      upserts++;
    }

    // 3) Recompute product totals/status across all points
    const products = await this.prisma.product.findMany({
      select: { product_id: true, reorder_level: true },
    });
    for (const p of products) {
      const aggregate = await this.prisma.location_stock.aggregate({
        where: { product_id: p.product_id },
        _sum: { quantity: true },
      });
      const totalQty = aggregate._sum.quantity ?? 0;
      // Simple status calculation based on reorder level
      const newStatus = totalQty === 0 ? 'OUT_OF_STOCK' : 
                       (p.reorder_level && totalQty <= p.reorder_level) ? 'LOW_STOCK' : 'IN_STOCK';
      await this.prisma.product.update({
        where: { product_id: p.product_id },
        data: { stock_quantity: totalQty },
      });
    }

    return { upserts };
  }
}
