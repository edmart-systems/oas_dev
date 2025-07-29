import { PurchaseRepository } from "@/modules/inventory/repositories/purchase.repository";
import { PurchaseService } from "@/modules/inventory/services/purchase.service";
import prisma from "../../../../../db/db";
import { NextRequest, NextResponse } from "next/server";
import { PurchaseDto } from "@/modules/inventory/dtos/purchase.dto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";


const service = new PurchaseService(new PurchaseRepository(prisma));
const sessionService = new SessionService

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Inject logged-in user's email or id here
    const tagData = {
      ...body,
      purchase_created_by: session.user?.email || session.user?.userId || "unknown",
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
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
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