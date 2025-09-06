import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { PurchaseOrderService } from "@/modules/inventory/services/purchase-order.service";
import { PurchaseOrderRepository } from "@/modules/inventory/repositories/purchase-order.repository";
import { PurchaseOrderDraftDto } from "@/modules/inventory/dtos/purchase-order.dto";
import { safeBodyParse } from "@/utils/api-utils/api.utils";
import { BAD_REQUEST_RESPONSE, NOT_AUTHORIZED_RESPONSE } from "@/utils/constants.utils";
import prisma from "../../../../../../db/db";

const repository = new PurchaseOrderRepository(prisma);
const service = new PurchaseOrderService(repository);
const sessionService = new SessionService();

// Fetch all PO drafts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const userId = session.user?.userId || 0;
    const drafts = await service.getUserPODrafts(userId);

    return NextResponse.json({
      status: true,
      message: "Successful",
      data: drafts,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      message: "Something went wrong",
    }, { status: 500 });
  }
}

// Add a new PO draft
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const body = await safeBodyParse(req);
    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const parsed = PurchaseOrderDraftDto.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const userId = session.user?.userId || 0;
    const draftData = {
      ...parsed.data,
      expected_delivery: parsed.data.expected_delivery ? new Date(parsed.data.expected_delivery) : undefined
    };
    const draft = await service.savePODraft(userId, draftData, 'manual');

    return NextResponse.json({
      status: true,
      message: "PO draft saved successfully",
      data: draft,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      message: err.message || "Something went wrong",
    }, { status: 500 });
  }
}

// Delete all user drafts
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const userId = session.user?.userId || 0;
    await service.deleteAllUserPODrafts(userId);

    return NextResponse.json({
      status: true,
      message: "All drafts deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      message: "Something went wrong",
    }, { status: 500 });
  }
}