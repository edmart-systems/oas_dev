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
   * Get all stock records with product & location
   */
  async getAll() {
    return this.prisma.stock.findMany({
      orderBy: { stock_id: "desc" },
      include: {
        product: { select: { product_id: true, product_name: true } },
        location: { select: { location_id: true, location_name: true } },
      },
    });
  }

  /**
   * Get stock record by ID with product & location
   */
  async getById(stock_id: number) {
    return this.prisma.stock.findUnique({
      where: { stock_id },
      include: {
        product: { select: { product_id: true, product_name: true } },
        location: { select: { location_id: true, location_name: true } },
      },
    });
  }

  /**
   * Get all stock entries for a specific product
   */
  async getByProduct(product_id: number) {
    return this.prisma.stock.findMany({
      where: { product_id },
      orderBy: { stock_id: "desc" },
      include: {
        product: { select: { product_id: true, product_name: true } },
        location: { select: { location_id: true, location_name: true } },
      },
    });
  }

  /**
   * Get stock for a specific location and product
   */
  async getByLocation(product_id: number, location_id: number) {
    return this.prisma.stock.findMany({
      where: {
        product_id,
        location_id,
      },
      orderBy: { stock_id: "desc" },
      include: {
        product: { select: { product_id: true, product_name: true } },
        location: { select: { location_id: true, location_name: true } },
      },
    });
  }
}
