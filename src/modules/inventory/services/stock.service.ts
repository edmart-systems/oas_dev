import { PrismaClient, Stock } from "@prisma/client";
import { StockDtoInput } from "../dtos/stock.dto";
import { StockRepository } from "../repositories/stock.repository";

export class StockService {
  constructor(
    private prisma: PrismaClient,
    private stockRepo: StockRepository
  ) {}

  /**
   * Create a stock entry and update the product quantity.
   */
  async createAndApplyStock(data: Omit<StockDtoInput, "resulting_stock">): Promise<Stock> {
    const { product_id, quantity_change } = data;

    // Get current product quantity
    const product = await this.prisma.product.findUnique({
      where: { product_id },
      select: { product_quantity: true },
    });

    if (!product) {
      throw new Error(`Product with ID ${product_id} not found.`);
    }

    const resulting_stock = product.product_quantity + quantity_change;

    // Create stock entry
    const stock = await this.stockRepo.create({
      ...data,
      resulting_stock,
    });

    // Update product quantity
    await this.prisma.product.update({
      where: { product_id },
      data: {
        product_quantity: resulting_stock,
      },
    });

    return stock;
  }
}
