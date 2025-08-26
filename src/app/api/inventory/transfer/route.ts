import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { TransferDto } from "@/modules/inventory/dtos/transfer.dto";
import { TransferRepository } from "@/modules/inventory/repositories/transfer.repository";
import { StockRepository } from "@/modules/inventory/repositories/stock.repository";
import { StockService } from "@/modules/inventory/services/stock.service";
import { TransferService } from "@/modules/inventory/services/transfer.service";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TransferDto.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const transferRepo = new TransferRepository(prisma);
    const stockRepo = new StockRepository(prisma);
    const stockService = new StockService(prisma, stockRepo);
    const transferService = new TransferService(prisma, transferRepo, stockService);

    const result = await transferService.createTransfer(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("Create transfer failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const transferRepo = new TransferRepository(prisma);
    const transferService = new TransferService(
      prisma,
      transferRepo,
      // stock service is not needed for GET, pass dummy
      new StockService(prisma, new StockRepository(prisma))
    );
    const list = await transferService.listTransfers();
    return NextResponse.json(list, { status: 200 });
  } catch (err: any) {
    console.error("List transfers failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
