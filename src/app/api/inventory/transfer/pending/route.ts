import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const transfers = await prisma.transfer.findMany({
      where: {
        assigned_user_id: parseInt(userId),
        status: "PENDING",
      },
      include: {
        from_location: { select: { location_id: true, location_name: true } },
        to_location: { select: { location_id: true, location_name: true } },
        assigned_user: { select: { userId: true, firstName: true, lastName: true } },
        creator: { select: { co_user_id: true, firstName: true, lastName: true } },
        items: {
          include: { product: { select: { product_id: true, product_name: true } } },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(transfers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}