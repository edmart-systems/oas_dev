import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { PurchaseOrderService } from "@/modules/inventory/services/purchase-order.service";
import { PurchaseOrderRepository } from "@/modules/inventory/repositories/purchase-order.repository";
import { safeBodyParse } from "@/utils/api-utils/api.utils";
import { BAD_REQUEST_RESPONSE, NOT_AUTHORIZED_RESPONSE } from "@/utils/constants.utils";
import { z } from "zod";
import prisma from "../../../../../../../db/db";

const repository = new PurchaseOrderRepository(prisma);
const service = new PurchaseOrderService(repository);
const sessionService = new SessionService();

const DeletePODraftSchema = z.object({
  userId: z.number(),
  draftId: z.number(),
});

// Delete single PO draft
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ draft_id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const { draft_id } = await params;
    const body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const parsed = DeletePODraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const { userId, draftId } = parsed.data;

    if (draft_id !== String(draftId)) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const success = await service.deletePODraft(userId, draftId);

    return NextResponse.json({
      status: success,
      message: success ? "Draft deleted successfully" : "Failed to delete draft",
    });
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      message: "Something went wrong",
    }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ draft_id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const { draft_id } = await params;
    const draftId = parseInt(draft_id);
    const userId = session.user?.userId || 0;

    if (isNaN(draftId)) {
      return NextResponse.json({ error: "Invalid draft ID" }, { status: 400 });
    }

    const draft = await service.getSinglePODraft(userId, draftId);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: true,
      message: "Success",
      data: draft,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      message: "Something went wrong",
    }, { status: 500 });
  }
}