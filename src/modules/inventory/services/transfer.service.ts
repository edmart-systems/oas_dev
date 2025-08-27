import { PrismaClient } from "@prisma/client";
import { TransferDtoInput } from "../dtos/transfer.dto";
import { TransferRepository } from "../repositories/transfer.repository";
import { StockRepository } from "../repositories/stock.repository";
import { StockService } from "./stock.service";

export class TransferService {
  constructor(
    private prisma: PrismaClient,
    private transferRepo: TransferRepository,
    private stockService: StockService
  ) {}

  /**
   * Creates a transfer document with items and applies stock moves between points
   */
  async createTransfer(data: TransferDtoInput) {
    const { from_inventory_point_id, to_inventory_point_id, note, items } = data;

    return await this.prisma.$transaction(async (tx) => {
      // repositories/services bound to the same tx
      const transferRepo = new TransferRepository(tx as unknown as PrismaClient);
      const stockRepo = new StockRepository(tx as unknown as PrismaClient);
      const stockServiceTx = new StockService(tx as unknown as PrismaClient, stockRepo);

      // Create transfer doc
      const transfer = await transferRepo.createTransferDocument(
        from_inventory_point_id,
        to_inventory_point_id,
        note
      );

      // Create items
      await transferRepo.createTransferItems(
        transfer.transfer_id,
        items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
      );

      // Apply stock movements per item
      for (const it of items) {
        // Move OUT from source (negative)
        await stockServiceTx.createAndApplyStock({
          product_id: it.product_id,
          inventory_point_id: from_inventory_point_id,
          change_type: "TRANSFER",
          quantity_change: -Math.abs(it.quantity),
          reference_id: transfer.transfer_id,
        } as any);

        // Move IN to destination (positive)
        await stockServiceTx.createAndApplyStock({
          product_id: it.product_id,
          inventory_point_id: to_inventory_point_id,
          change_type: "TRANSFER",
          quantity_change: Math.abs(it.quantity),
          reference_id: transfer.transfer_id,
        } as any);
      }

      return transfer;
    });
  }

  async listTransfers() {
    return this.transferRepo.listTransfers();
  }
}
