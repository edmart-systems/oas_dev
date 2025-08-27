import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/inventory/analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&inventory_point_id=number
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const point = searchParams.get("inventory_point_id");

    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    const inventory_point_id = point ? Number(point) : undefined;

    // Current inventory valuation and low/out stock
    const invStocks = await prisma.inventory_stock.findMany({
      where: inventory_point_id ? { inventory_point_id } : undefined,
      include: { product: true },
    });

    let valuation = 0;
    let low_stock_count = 0;
    let out_of_stock_count = 0;

    for (const row of invStocks) {
      const onHand = row.quantity ?? 0;
      const minQty = row.product.product_min_quantity ?? 0;
      const cost = row.product.buying_price ?? 0;
      valuation += onHand * cost;
      if (onHand <= (minQty || 0)) low_stock_count += 1;
      if (onHand <= 0) out_of_stock_count += 1;
    }

    const denom = invStocks.length || 1;
    const out_of_stock_rate = out_of_stock_count / denom;

    // Sales in period
    const sales: { sale_grand_total: number }[] = await prisma.sale.findMany({
      where: {
        sale_created_at: { gte: fromDate, lte: toDate },
        ...(inventory_point_id ? { inventory_point_id } : {}),
      },
      select: { sale_grand_total: true },
    });
    const sales_period_amount = sales.reduce((s: number, x: { sale_grand_total: number }) => s + (x.sale_grand_total ?? 0), 0);

    return NextResponse.json({
      valuation,
      low_stock_count,
      out_of_stock_rate,
      sales_period_amount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
