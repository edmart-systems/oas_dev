import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/inventory/alerts
// Optional query params:
// - location_id: number (filter alerts by specific location)
// - type: comma-separated list of alert types to include e.g. "low_stock,stockout,overstock"
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("location_id");
    const typeFilter = (searchParams.get("type") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const where: any = {};
    if (locationId) {
      const parsed = Number(locationId);
      if (Number.isNaN(parsed)) {
        return NextResponse.json(
          { error: "location_id must be numeric" },
          { status: 400 }
        );
      }
      where.location_id = parsed;
    }

    // Join location stock with product and location
    const stocks = await prisma.location_stock.findMany({
      where,
      include: {
        product: {
          select: {
            product_id: true,
            product_name: true,
            reorder_level: true,
          },
        },
        location: { select: { location_id: true, location_name: true } },
      },
      orderBy: [{ location_id: "asc" }, { product_id: "asc" }],
    });

    type AlertType = "low_stock" | "stockout" | "overstock";

    const alerts = stocks.flatMap((row) => {
      const alertsForRow: Array<{
        type: AlertType;
        product_id: number;
        product_name: string;
        location_id: number;
        location_name: string;
        quantity: number;
        min?: number | null;
        max?: number | null;
        message: string;
      }> = [];

      const qty = row.quantity ?? 0;
      const min = row.product.reorder_level ?? 0;
      const max = 100; // Default max since no max field exists

      // stockout
      if (qty === 0) {
        alertsForRow.push({
          type: "stockout",
          product_id: row.product_id,
          product_name: row.product.product_name,
          location_id: row.location_id,
          location_name: row.location.location_name,
          quantity: qty,
          min,
          max,
          message: `Stockout: ${row.product.product_name} at ${row.location.location_name}`,
        });
      }

      // low stock (<= min) but not stockout (already added)
      if (qty > 0 && min > 0 && qty <= min) {
        alertsForRow.push({
          type: "low_stock",
          product_id: row.product_id,
          product_name: row.product.product_name,
          location_id: row.location_id,
          location_name: row.location.location_name,
          quantity: qty,
          min,
          max,
          message: `Low stock: ${row.product.product_name} at ${row.location.location_name} (qty ${qty} <= min ${min})`,
        });
      }

      // overstock (>= max) when a max is configured (>0)
      if (max > 0 && qty >= max) {
        alertsForRow.push({
          type: "overstock",
          product_id: row.product_id,
          product_name: row.product.product_name,
          location_id: row.location_id,
          location_name: row.location.location_name,
          quantity: qty,
          min,
          max,
          message: `Overstock: ${row.product.product_name} at ${row.location.location_name} (qty ${qty} >= max ${max})`,
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