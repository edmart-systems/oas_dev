import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { StockDto } from "@/modules/inventory/dtos/stock.dto";
import { StockRepository } from "@/modules/inventory/repositories/stock.repository";
import { StockService } from "@/modules/inventory/services/stock.service";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate: allow negative quantity_change; resulting_stock is derived in service
    const parsed = StockDto.omit({ resulting_stock: true }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const stockRepo = new StockRepository(prisma);
    const stockService = new StockService(prisma, stockRepo);

    const updated = await stockService.createAndApplyStock(parsed.data);

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("Stock adjustment failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
