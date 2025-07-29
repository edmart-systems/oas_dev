import { PurchaseItemService } from "@/modules/inventory/services/purchase_item.service";
import { PurchaseItemRepository } from "@/modules/inventory/repositories/purchase_item.repository";
import prisma from "../../../../../db/db";  
import { NextRequest, NextResponse } from "next/server";
import { PurchaseItemDto } from "@/modules/inventory/dtos/purchase_item.dto";       
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";

const service = new PurchaseItemService(new PurchaseItemRepository(prisma));
const sessionService = new SessionService();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Inject logged-in user's email or id here
    const itemData = {
      ...body,
      purchase_created_by: session.user?.email || session.user?.userId || "unknown",
    };

    const parsed = PurchaseItemDto.safeParse(itemData);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newPurchaseItem = await service.createPurchaseItem(parsed.data);
    return NextResponse.json(
      { message: "Purchase item created successfully", data: newPurchaseItem },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const purchaseItems = await service.getAllPurchaseItems();
    return NextResponse.json(purchaseItems);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
