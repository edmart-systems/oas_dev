import { PurchaseRepository } from "@/modules/inventory/repositories/purchase.repository";
import { PurchaseService } from "@/modules/inventory/services/purchase.service";
import prisma from "../../../../../db/db";
import { NextRequest, NextResponse } from "next/server";
import { PurchaseDto } from "@/modules/inventory/dtos/purchase.dto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";


import { PurchaseItemRepository } from "@/modules/inventory/repositories/purchase_item.repository";

const purchaseRepo = new PurchaseRepository(prisma);
const purchaseItemRepo = new PurchaseItemRepository(prisma);
const service = new PurchaseService(prisma, purchaseRepo, purchaseItemRepo);
const sessionService = new SessionService

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Get current location from system settings or use first MAIN_STORE
    const currentLocationSetting = await prisma.systemSetting.findUnique({
      where: { setting_key: "current_location_id" }
    });
    
    let currentLocationId: number;
    if (currentLocationSetting?.setting_value) {
      currentLocationId = parseInt(currentLocationSetting.setting_value);
    } else {
      // Find first MAIN_STORE location
      const mainStore = await prisma.location.findFirst({
        where: { location_type: 'MAIN_STORE' },
        select: { location_id: true }
      });
      if (!mainStore) {
        throw new Error('No main store location found. Please create a main store location first.');
      }
      currentLocationId = mainStore.location_id;
    }

    const tagData = {
      ...body,
      location_id: currentLocationId,
      purchase_created_by: session.user?.co_user_id || "unknown",
    };

    const parsed = PurchaseDto.safeParse(tagData);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newPurchase = await service.createPurchase(parsed.data);
    return NextResponse.json(
      { message: "Purchase created successfully", data: newPurchase },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Purchase API Error:', err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error", stack: err.stack },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    const tags = await service.getAllPurchases();
    return NextResponse.json(tags);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}