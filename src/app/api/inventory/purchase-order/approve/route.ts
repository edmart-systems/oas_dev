import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { PurchaseOrderService } from "@/modules/inventory/services/purchase-order.service";
import { PurchaseOrderRepository } from "@/modules/inventory/repositories/purchase-order.repository";
import { POApprovalActionDto } from "@/modules/inventory/dtos/purchase-order.dto";
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

    const body = await req.json();
    const parsed = POApprovalActionDto.safeParse(body);

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

    const { po_id, status, remarks } = parsed.data;
    const userId = session.user?.userId || 0;

    let result;
    if (status === 'Approved') {
      result = await service.approvePurchaseOrder(po_id, userId, remarks);
    } else {
      result = await service.rejectPurchaseOrder(po_id, userId, remarks);
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}