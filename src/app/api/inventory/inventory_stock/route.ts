import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { InventoryStockRepository } from "@/modules/inventory/repositories/inventory_stock.repository";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const repo = new InventoryStockRepository(prisma);
    const list = await repo.getAll();
    return NextResponse.json(list, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch inventory stock:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
