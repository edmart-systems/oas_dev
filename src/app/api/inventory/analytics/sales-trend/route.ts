import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/inventory/analytics/sales-trend?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month&inventory_point_id=number
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const groupBy = (searchParams.get("groupBy") || "day").toLowerCase();
    const point = searchParams.get("inventory_point_id");

    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    const inventory_point_id = point ? Number(point) : undefined;

    const sales = await prisma.sale.findMany({
      where: {
        sale_created_at: { gte: fromDate, lte: toDate },
        ...(inventory_point_id ? { inventory_point_id } : {}),
      },
      select: {
        sale_created_at: true,
        sale_grand_total: true,
      },
      orderBy: { sale_created_at: "asc" },
    });

    const formatKey = (d: Date) => {
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const dy = String(d.getDate()).padStart(2, "0");
      if (groupBy === "month") return `${yr}-${mo}`;
      if (groupBy === "week") {
        // ISO week number
        const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = tmp.getUTCDay() || 7;
        tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((tmp as any) - (yearStart as any)) / 86400000 + 1) / 7);
        return `${yr}-W${String(weekNo).padStart(2, "0")}`;
      }
      return `${yr}-${mo}-${dy}`;
    };

    const bucket: Record<string, { total_amount: number; count: number } > = {};
    for (const s of sales) {
      const dt = new Date(s.sale_created_at as any);
      const key = formatKey(dt);
      const amt = s.sale_grand_total ?? 0;
      if (!bucket[key]) bucket[key] = { total_amount: 0, count: 0 };
      bucket[key].total_amount += amt;
      bucket[key].count += 1;
    }

    const rows = Object.entries(bucket)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, v]) => ({ period, total_amount: v.total_amount, transactions: v.count }));

    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
