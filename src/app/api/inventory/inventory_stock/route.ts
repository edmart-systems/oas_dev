import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { InventoryStockService } from "@/modules/inventory/services/inventory_stock.service";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const service = new InventoryStockService(prisma);
    const list = await service.getAll();
    return NextResponse.json(list, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch inventory stock:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
