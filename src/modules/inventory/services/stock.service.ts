import { PrismaClient, stock } from "@prisma/client";
import { StockDtoInput } from "../dtos/stock.dto";
import { StockRepository } from "../repositories/stock.repository";
import { calculateProductStatus } from "../methods/purchase.method";

export class StockService {
  constructor(
    private prisma: PrismaClient,
    private stockRepo: StockRepository
  ) {}

  async createAndApplyStock(data: Omit<StockDtoInput, "resulting_stock">): Promise<stock> {
    const { product_id, quantity_change } = data;

    const product = await this.prisma.product.findUnique({
      where: { product_id },
      select: { 
        product_quantity: true,
        product_min_quantity: true,
        product_max_quantity: true,
        product_name: true
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${product_id} not found.`);
    }

    const resulting_stock = product.product_quantity + quantity_change;
    
    if (quantity_change < 0 && product.product_quantity < Math.abs(quantity_change)) {
      throw new Error(`Insufficient stock for product ${product.product_name}. Available: ${product.product_quantity}, Required: ${Math.abs(quantity_change)}`);
    }
    const newStatus = calculateProductStatus(
      resulting_stock,
      product.product_min_quantity ?? null,
      product.product_max_quantity ?? null
    );

    const stock = await this.stockRepo.create({
      ...data,
      resulting_stock,
    });

    await this.prisma.product.update({
      where: { product_id },
      data: {
        product_quantity: resulting_stock,
        product_status: newStatus
      },
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
}
