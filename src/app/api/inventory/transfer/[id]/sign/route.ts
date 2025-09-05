import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { TransferService } from "@/modules/inventory/services/transfer.service";
import { TransferRepository } from "@/modules/inventory/repositories/transfer.repository";
import { StockService } from "@/modules/inventory/services/stock.service";
import { StockRepository } from "@/modules/inventory/repositories/stock.repository";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { signature_data } = await req.json();
    const transferId = parseInt(params.id);

    if (!signature_data) {
      return NextResponse.json({ error: "Signature required" }, { status: 400 });
    }

    const transferRepo = new TransferRepository(prisma);
    const stockRepo = new StockRepository(prisma);
    const stockService = new StockService(prisma, stockRepo);
    const transferService = new TransferService(prisma, transferRepo, stockService);

    // Sign transfer and apply stock movements
    const transfer = await transferService.signTransfer(transferId, signature_data);

    return NextResponse.json({
      message: "Transfer signed and stock updated successfully",
      transfer
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}