import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { StockRepository } from "@/modules/inventory/repositories/stock.repository";
import { StockService } from "@/modules/inventory/services/stock.service";

const prisma = new PrismaClient();
const stockRepo = new StockRepository(prisma);
const stockService = new StockService(prisma, stockRepo);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pid = Number(searchParams.get("product_id"));
    const ipid = Number(searchParams.get("inventory_point_id"));

    if (!pid || !ipid || Number.isNaN(pid) || Number.isNaN(ipid)) {
      return NextResponse.json(
        { error: "product_id and inventory_point_id are required numeric query params" },
        { status: 400 }
      );
    }

    const quantity = await stockService.getAvailableAtPoint(pid, ipid);
    return NextResponse.json({ product_id: pid, inventory_point_id: ipid, quantity });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
