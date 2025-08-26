import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../db/db";


// GET /api/inventory/product/available?inventory_point_id=3&q=search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ipid = Number(searchParams.get("inventory_point_id"));
    const q = (searchParams.get("q") || "").trim();
    const qNum = q !== "" && !Number.isNaN(Number(q)) ? Number(q) : null;

    if (!ipid || Number.isNaN(ipid)) {
      return NextResponse.json(
        { error: "inventory_point_id is required and must be a number" },
        { status: 400 }
      );
    }

    // 1) Find inventory entries with stock > 0 at the point
    const invRows = await prisma.inventory_stock.findMany({
      where: { inventory_point_id: ipid, quantity: { gt: 0 } },
      select: { product_id: true, quantity: true },
    });

    if (invRows.length === 0) {
      return NextResponse.json({ items: [], count: 0 });
    }

    const byId = new Map<number, number>();
    for (const r of invRows) byId.set(r.product_id, r.quantity);

    const productIds = invRows.map((r) => r.product_id);

    // 2) Fetch products and (optionally) filter by search term
    const products = await prisma.product.findMany({
      where: {
        product_id: { in: productIds },
        ...(q
          ? {
              OR: [
                { product_name: { contains: q } },
                ...(qNum !== null ? [{ product_barcode: qNum }] : []),
              ],
            }
          : {}),
      },
      select: {
        product_id: true,
        product_name: true,
        product_barcode: true,
        unit_id: true,
        product_status: true,
      },
    });

    // 3) Attach available quantity at this point
    const items = products.map((p) => ({
      ...p,
      available_quantity: byId.get(p.product_id) ?? 0,
      inventory_point_id: ipid,
    }));

    return NextResponse.json({ items, count: items.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
