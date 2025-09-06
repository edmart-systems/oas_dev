import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { PurchaseOrderService } from "@/modules/inventory/services/purchase-order.service";
import { PurchaseOrderRepository } from "@/modules/inventory/repositories/purchase-order.repository";
import { sendPOIssuedEmail } from "@/comm/emails/purchase-order.emails";
import { generatePOPDF } from "@/utils/pdf/purchase-order-pdf.utils";
import { z } from "zod";
import prisma from "../../../../../../db/db";

const repository = new PurchaseOrderRepository(prisma);
const service = new PurchaseOrderService(repository);
const sessionService = new SessionService();

const SendPOSchema = z.object({
  po_id: z.number().positive(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has procurement role (role_id 3) or admin (role_id 1)
    if (session.user?.role_id !== 3 && session.user?.role_id !== 1) {
      return NextResponse.json({ error: "Only procurement team can send POs to suppliers" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = SendPOSchema.safeParse(body);

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

    const { po_id, message } = parsed.data;
    
    const po = await service.getPurchaseOrderById(po_id);
    if (!po) {
      return NextResponse.json({ error: "Purchase Order not found" }, { status: 404 });
    }

    if (po.status !== 'Issued') {
      return NextResponse.json({ error: "Only issued POs can be sent to suppliers" }, { status: 400 });
    }

    if (!po.supplier.supplier_email) {
      return NextResponse.json({ error: "Supplier email not found" }, { status: 400 });
    }

    // Generate PDF
    const pdfBuffer = await generatePOPDF(po);

    // Send email to supplier
    await sendPOIssuedEmail({
      poNumber: po.po_number,
      supplierName: po.supplier.supplier_name,
      supplierEmail: po.supplier.supplier_email,
      totalAmount: po.total_amount.toFixed(2),
      currency: po.currency.currency_code,
      expectedDelivery: po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : undefined,
      items: po.items.map((item: any) => ({
        productName: item.product.product_name,
        quantity: item.quantity_ordered,
        unitPrice: item.unit_price.toFixed(2),
        totalPrice: item.total_price.toFixed(2),
      })),
      pdfAttachment: pdfBuffer,
    });

    return NextResponse.json({
      success: true,
      message: `Purchase Order ${po.po_number} sent to ${po.supplier.supplier_name} successfully`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}