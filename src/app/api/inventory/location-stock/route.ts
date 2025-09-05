import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const locationStock = await prisma.location_stock.findMany({
      include: {
        product: {
          select: {
            product_id: true,
            product_name: true,
            sku_code: true,
            reorder_level: true,
            product_updated_at: true,
          }
        },
        location: {
          select: {
            location_id: true,
            location_name: true,
          }
        }
      },
      orderBy: {
        product: {
          product_name: 'asc'
        }
      }
    });

    const formattedStock = locationStock.map(stock => ({
      location_stock_id: stock.location_stock_id,
      product_id: stock.product_id,
      location_id: stock.location_id,
      quantity: stock.quantity,
      product: stock.product,
      location: stock.location,
      status: stock.quantity === 0 ? 'Out of Stock' : 
              stock.quantity <= (stock.product?.reorder_level || 0) ? 'Low Stock' : 'Normal',
    }));

    return NextResponse.json(formattedStock);
  } catch (err: any) {
    console.error("Failed to fetch location stock:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}