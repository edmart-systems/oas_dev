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

// Get latest auto-draft
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const userId = session.user?.userId || 0;
    const autoDraft = await service.getLatestAutoDraft(userId);

    return NextResponse.json({
      status: true,
      message: "Success",
      data: autoDraft,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      message: "Something went wrong",
    }, { status: 500 });
  }
}

// Save auto-draft
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
    
    // Delete existing auto-draft first
    await service.deleteAutoDraft(userId);
    
    // Save new auto-draft
    const draftData = {
      ...parsed.data,
      expected_delivery: parsed.data.expected_delivery ? new Date(parsed.data.expected_delivery) : undefined
    };
    const draft = await service.savePODraft(userId, draftData, 'auto');

    return NextResponse.json({
      status: true,
      message: "Auto-draft saved successfully",
      data: draft,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      message: "Something went wrong",
    }, { status: 500 });
  }
}

// Delete auto-draft
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const userId = session.user?.userId || 0;
    await service.deleteAutoDraft(userId);

    return NextResponse.json({
      status: true,
      message: "Auto-draft deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      message: "Something went wrong",
    }, { status: 500 });
  }
}