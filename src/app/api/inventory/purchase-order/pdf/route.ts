import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { PurchaseOrderService } from "@/modules/inventory/services/purchase-order.service";
import { PurchaseOrderRepository } from "@/modules/inventory/repositories/purchase-order.repository";
import { generatePOPDF } from "@/utils/pdf/purchase-order-pdf.utils";
import prisma from "../../../../../../db/db";

const repository = new PurchaseOrderRepository(prisma);
const service = new PurchaseOrderService(repository);
const sessionService = new SessionService();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const poId = searchParams.get('po_id');
    const preview = searchParams.get('preview') === 'true';

    if (!poId) {
      return NextResponse.json({ error: "PO ID is required" }, { status: 400 });
    }

    const po = await service.getPurchaseOrderById(parseInt(poId));
    if (!po) {
      return NextResponse.json({ error: "Purchase Order not found" }, { status: 404 });
    }

    // Check permissions
    const userId = session.user?.userId || 0;
    const isAdmin = session.user?.role_id === 1;
    const isProcurement = session.user?.role_id === 3;
    const isRequester = po.requester_id === userId;
    const isApprover = po.approvals.some(a => a.approver_id === userId);

    if (!isAdmin && !isProcurement && !isRequester && !isApprover) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const pdfBuffer = await generatePOPDF(po);

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    
    if (preview) {
      headers.set('Content-Disposition', `inline; filename="PO-${po.po_number}.pdf"`);
    } else {
      headers.set('Content-Disposition', `attachment; filename="PO-${po.po_number}.pdf"`);
    }

    return new NextResponse(new Uint8Array(pdfBuffer), { headers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}