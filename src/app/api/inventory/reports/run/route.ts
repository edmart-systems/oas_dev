import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../db/db";

// POST /api/inventory/reports/run
// body: { report_type: "sales-summary", params: { from?: string (YYYY-MM-DD), to?: string, inventory_point_ids?: number[], product_ids?: number[] } }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report_type: string = body?.report_type;
    const params = body?.params || {};

    switch (report_type) {
      case "sales-summary":
        return NextResponse.json(await runSalesSummary(params));
      default:
        return NextResponse.json({ error: `Unsupported report_type: ${report_type}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}

async function runSalesSummary(params: any) {
  const from = params?.from ? new Date(params.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = params?.to ? new Date(params.to) : new Date();
  const pointIds: number[] | undefined = Array.isArray(params?.inventory_point_ids) && params.inventory_point_ids.length
    ? params.inventory_point_ids.map((n: any) => Number(n)).filter((n: number) => !Number.isNaN(n))
    : undefined;
  const productIds: number[] | undefined = Array.isArray(params?.product_ids) && params.product_ids.length
    ? params.product_ids.map((n: any) => Number(n)).filter((n: number) => !Number.isNaN(n))
    : undefined;

  // If product filter provided, we need to look at sale items; else aggregate sales documents
  if (productIds && productIds.length > 0) {
    const items = await prisma.sale_item.findMany({
      where: {
        product_id: { in: productIds },
        sale: {
          sale_created_at: { gte: from, lte: to },
          ...(pointIds ? { inventory_point_id: { in: pointIds } } : {}),
        },
      },
      select: {
        total_price: true,
        sale: { select: { sale_created_at: true } },
      },
      orderBy: { sale: { sale_created_at: "asc" } },
    });

    const bucket: Record<string, { total_amount: number; transactions: number }> = {};
    for (const it of items) {
      const dt = new Date(it.sale!.sale_created_at as any);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      if (!bucket[key]) bucket[key] = { total_amount: 0, transactions: 0 };
      bucket[key].total_amount += it.total_price ?? 0;
      bucket[key].transactions += 1;
    }

    const rows = Object.entries(bucket)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ date, total_amount: v.total_amount, transactions: v.transactions }));

    const meta = { summary: { total_amount: rows.reduce((s, r) => s + r.total_amount, 0), transactions: rows.reduce((s, r) => s + r.transactions, 0) } };
    return { rows, meta };
  }

  // No product filter: use sales table
  const sales = await prisma.sale.findMany({
    where: {
      sale_created_at: { gte: from, lte: to },
      ...(pointIds ? { inventory_point_id: { in: pointIds } } : {}),
    },
    select: { sale_created_at: true, sale_grand_total: true },
    orderBy: { sale_created_at: "asc" },
  });

  const bucket: Record<string, { total_amount: number; transactions: number }> = {};
  for (const s of sales) {
    const dt = new Date(s.sale_created_at as any);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    if (!bucket[key]) bucket[key] = { total_amount: 0, transactions: 0 };
    bucket[key].total_amount += s.sale_grand_total ?? 0;
    bucket[key].transactions += 1;
  }

  const rows = Object.entries(bucket)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, total_amount: v.total_amount, transactions: v.transactions }));

  const meta = { summary: { total_amount: rows.reduce((s, r) => s + r.total_amount, 0), transactions: rows.reduce((s, r) => s + r.transactions, 0) } };
  return { rows, meta };
}
