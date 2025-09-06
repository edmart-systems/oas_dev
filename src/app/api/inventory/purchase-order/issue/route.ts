import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { PurchaseOrderService } from "@/modules/inventory/services/purchase-order.service";
import { PurchaseOrderRepository } from "@/modules/inventory/repositories/purchase-order.repository";
import { POStatusUpdateDto } from "@/modules/inventory/dtos/purchase-order.dto";
import prisma from "../../../../../../db/db";

const repository = new PurchaseOrderRepository(prisma);
const service = new PurchaseOrderService(repository);
const sessionService = new SessionService();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has procurement role (role_id 3) or admin (role_id 1)
    if (session.user?.role_id !== 3 && session.user?.role_id !== 1) {
      return NextResponse.json({ error: "Only procurement team can issue POs" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = POStatusUpdateDto.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { 
          message: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
          error: "Invalid input" 
        },
        { status: 400 }
      );
    }

    const { po_id } = parsed.data;
    const result = await service.issuePurchaseOrder(po_id);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}