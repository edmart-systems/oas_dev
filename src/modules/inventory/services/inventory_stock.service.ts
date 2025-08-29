import { PrismaClient } from "@prisma/client";
import { InventoryStockRepository } from "../repositories/inventory_stock.repository";
import { InventoryStockDto } from "../dtos/inventory_stock.dto";

export class InventoryStockService {
  private repo: InventoryStockRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new InventoryStockRepository(prisma);
  }

  async getAll(): Promise<InventoryStockDto[]> {
    return this.repo.getAll();
  }
}
