import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { PurchaseOrderService } from "@/modules/inventory/services/purchase-order.service";
import { PurchaseOrderRepository } from "@/modules/inventory/repositories/purchase-order.repository";
import prisma from "../../../../../../db/db";

const repository = new PurchaseOrderRepository(prisma);
const service = new PurchaseOrderService(repository);
const sessionService = new SessionService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const poId = parseInt(id);

    if (isNaN(poId)) {
      return NextResponse.json({ error: "Invalid PO ID" }, { status: 400 });
    }

    const po = await service.getPurchaseOrderById(poId);
    if (!po) {
      return NextResponse.json({ error: "Purchase Order not found" }, { status: 404 });
    }

    return NextResponse.json(po);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}