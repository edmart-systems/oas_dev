import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/inventory/alerts
// Optional query params:
// - inventory_point_id: number (filter alerts by specific inventory point)
// - type: comma-separated list of alert types to include e.g. "low_stock,stockout,overstock"
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ipid = searchParams.get("inventory_point_id");
    const typeFilter = (searchParams.get("type") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const where: any = {};
    if (ipid) {
      const parsed = Number(ipid);
      if (Number.isNaN(parsed)) {
        return NextResponse.json(
          { error: "inventory_point_id must be numeric" },
          { status: 400 }
        );
      }
      where.inventory_point_id = parsed;
    }

    // Join inventory stock with product and inventory point
    const stocks = await prisma.inventory_stock.findMany({
      where,
      include: {
        product: {
          select: {
            product_id: true,
            product_name: true,
            product_min_quantity: true,
            product_max_quantity: true,
          },
        },
        inventory_point: { select: { inventory_point_id: true, inventory_point: true } },
      },
      orderBy: [{ inventory_point_id: "asc" }, { product_id: "asc" }],
    });

    type AlertType = "low_stock" | "stockout" | "overstock";

    const alerts = stocks.flatMap((row) => {
      const alertsForRow: Array<{
        type: AlertType;
        product_id: number;
        product_name: string;
        inventory_point_id: number;
        inventory_point: string;
        quantity: number;
        min?: number | null;
        max?: number | null;
        message: string;
      }> = [];

      const qty = row.quantity ?? 0;
      const min = row.product.product_min_quantity ?? 0;
      const max = row.product.product_max_quantity ?? 0;

      // stockout
      if (qty === 0) {
        alertsForRow.push({
          type: "stockout",
          product_id: row.product_id,
          product_name: row.product.product_name,
          inventory_point_id: row.inventory_point_id,
          inventory_point: row.inventory_point.inventory_point,
          quantity: qty,
          min,
          max,
          message: `Stockout: ${row.product.product_name} at ${row.inventory_point.inventory_point}`,
        });
      }

      // low stock (<= min) but not stockout (already added)
      if (qty > 0 && min > 0 && qty <= min) {
        alertsForRow.push({
          type: "low_stock",
          product_id: row.product_id,
          product_name: row.product.product_name,
          inventory_point_id: row.inventory_point_id,
          inventory_point: row.inventory_point.inventory_point,
          quantity: qty,
          min,
          max,
          message: `Low stock: ${row.product.product_name} at ${row.inventory_point.inventory_point} (qty ${qty} <= min ${min})`,
        });
      }

      // overstock (>= max) when a max is configured (>0)
      if (max > 0 && qty >= max) {
        alertsForRow.push({
          type: "overstock",
          product_id: row.product_id,
          product_name: row.product.product_name,
          inventory_point_id: row.inventory_point_id,
          inventory_point: row.inventory_point.inventory_point,
          quantity: qty,
          min,
          max,
          message: `Overstock: ${row.product.product_name} at ${row.inventory_point.inventory_point} (qty ${qty} >= max ${max})`,
        });
      }

      return alertsForRow;
    });

    const filtered = typeFilter.length
      ? alerts.filter((a) => typeFilter.includes(a.type))
      : alerts;

    return NextResponse.json({ count: filtered.length, alerts: filtered });
  } catch (err: any) {
    console.error("Failed to compute alerts:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
