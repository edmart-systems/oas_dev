import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";   
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";   
import { PrismaClient } from "@prisma/client";
import { PurchaseItemRepository } from "@/modules/inventory/repositories/purchase_item.repository";
import { PurchaseItemService } from "@/modules/inventory/services/purchase_item.service";

const service = new PurchaseItemService(new PurchaseItemRepository(new PrismaClient()));    


export async function GET() {
  try {
    const tags = await service.getAllPurchaseItems();
    return NextResponse.json(tags);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}