import { PrismaClient, stock } from "@prisma/client";
import { StockDtoInput } from "../dtos/stock.dto"; 

export class StockRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a stock record
   */
  async create(data: StockDtoInput): Promise<stock> {
    return this.prisma.stock.create({
      data,
    });
  }

  /**
   * Get all stock records
   */
  async getAll(): Promise<stock[]> {
    return this.prisma.stock.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Get stock record by ID
   */
  async getById(stock_id: number): Promise<stock | null> {
    return this.prisma.stock.findUnique({
      where: { stock_id },
    });
  }

  /**
   * Get all stock entries for a specific product
   */
  async getByProduct(product_id: number): Promise<stock[]> {
    return this.prisma.stock.findMany({
      where: { product_id },
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Get stock for a specific inventory point and product
   */
  async getByInventoryPoint(product_id: number, inventory_point_id: number): Promise<stock[]> {
    return this.prisma.stock.findMany({
      where: {
        product_id,
        inventory_point_id,
      },
      orderBy: { created_at: "desc" },
    });
  }
}
