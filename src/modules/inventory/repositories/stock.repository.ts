import { PrismaClient, type Prisma, Stock } from "@prisma/client";
import { StockDtoInput } from "../dtos/stock.dto"; 

export class StockRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  /**
   * Create a stock record
   */
  async create(data: StockDtoInput): Promise<Stock> {
    return this.prisma.stock.create({
      data,
    });
  }

  /**
   * Get all stock records with product & inventory point
   */
  async getAll() {
    return this.prisma.stock.findMany({
      orderBy: { created_at: "desc" },
      include: {
        product: { select: { product_id: true, product_name: true } },
        inventory_point: { select: { inventory_point_id: true, inventory_point: true } },
      },
    });
  }

  /**
   * Get stock record by ID with product & inventory point
   */
  async getById(stock_id: number) {
    return this.prisma.stock.findUnique({
      where: { stock_id },
      include: {
        product: { select: { product_id: true, product_name: true } },
        inventory_point: { select: { inventory_point_id: true, inventory_point: true } },
      },
    });
  }

  /**
   * Get all stock entries for a specific product
   */
  async getByProduct(product_id: number) {
    return this.prisma.stock.findMany({
      where: { product_id },
      orderBy: { created_at: "desc" },
      include: {
        product: { select: { product_id: true, product_name: true } },
        inventory_point: { select: { inventory_point_id: true, inventory_point: true } },
      },
    });
  }

  /**
   * Get stock for a specific inventory point and product
   */
  async getByInventoryPoint(product_id: number, inventory_point_id: number) {
    return this.prisma.stock.findMany({
      where: {
        product_id,
        inventory_point_id,
      },
      orderBy: { created_at: "desc" },
      include: {
        product: { select: { product_id: true, product_name: true } },
        inventory_point: { select: { inventory_point_id: true, inventory_point: true } },
      },
    });
  }
}
