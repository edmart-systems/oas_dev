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
   * Creates a transfer document with items - NO stock changes until signed
   */
  async createTransfer(data: TransferDtoInput & { created_by: string }) {
    const { from_location_id, to_location_id, assigned_user_id, created_by, note, items } = data;

    return await this.prisma.$transaction(async (tx) => {
      const transferRepo = new TransferRepository(tx as unknown as PrismaClient);

      // Create transfer doc with PENDING status
      const transfer = await transferRepo.createTransferDocument(
        from_location_id,
        to_location_id,
        assigned_user_id,
        created_by,
        note
      );

      // Create items
      await transferRepo.createTransferItems(
        transfer.transfer_id,
        items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
      );

      // NO stock movements here - only when signed
      return transfer;
    });
  }

  /**
   * Sign transfer and apply stock movements
   */
  async signTransfer(transferId: number, signatureData: string) {
    return await this.prisma.$transaction(async (tx) => {
      const transferRepo = new TransferRepository(tx as unknown as PrismaClient);
      const stockRepo = new StockRepository(tx as unknown as PrismaClient);
      const stockServiceTx = new StockService(tx as unknown as PrismaClient, stockRepo);

      // Get transfer with items
      const transfer = await tx.transfer.findUnique({
        where: { transfer_id: transferId },
        include: { items: true }
      });

      if (!transfer) {
        throw new Error('Transfer not found');
      }

      if (transfer.status !== 'PENDING') {
        throw new Error('Transfer already processed');
      }

      // Apply stock movements per item
      for (const item of transfer.items) {
        // Move OUT from source (negative)
        await stockServiceTx.createAndApplyStock({
          product_id: item.product_id,
          location_id: transfer.from_location_id,
          change_type: "TRANSFER",
          quantity_change: -Math.abs(item.quantity),
          reference_id: transfer.transfer_id,
        } as any);

        // Move IN to destination (positive)
        await stockServiceTx.createAndApplyStock({
          product_id: item.product_id,
          location_id: transfer.to_location_id,
          change_type: "TRANSFER",
          quantity_change: Math.abs(item.quantity),
          reference_id: transfer.transfer_id,
        } as any);
      }

      // Update transfer status and signature
      await tx.transfer.update({
        where: { transfer_id: transferId },
        data: {
          status: 'COMPLETED',
          signature_data: signatureData
        }
      });

      return transfer;
    });
  }

  async listTransfers() {
    return this.transferRepo.listTransfers();
  }
}
