import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { PurchaseOrderService } from "@/modules/inventory/services/purchase-order.service";
import { PurchaseOrderRepository } from "@/modules/inventory/repositories/purchase-order.repository";
import { CreatePurchaseOrderDto, PaginatedPOParamsDto } from "@/modules/inventory/dtos/purchase-order.dto";
import prisma from "../../../../../db/db";

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
    const parsed = CreatePurchaseOrderDto.safeParse(body);

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

    const po = await service.createPurchaseOrder(parsed.data, session.user?.userId || 0);
    return NextResponse.json(po, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const supplier_id = searchParams.get('supplier_id');
    const requester_id = searchParams.get('requester_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const search = searchParams.get('search');

    const params = {
      page,
      limit,
      filter: {
        status,
        supplier_id: supplier_id ? parseInt(supplier_id) : undefined,
        requester_id: requester_id ? parseInt(requester_id) : undefined,
        date_from,
        date_to,
        search,
      },
      userId: session.user?.userId || 0,
      isAdmin: session.user?.role_id === 1,
    };

    const result = await service.getPaginatedPurchaseOrders(params);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { po_id, ...updateData } = body;
    
    if (!po_id) {
      return NextResponse.json({ error: "PO ID is required" }, { status: 400 });
    }

    const parsed = CreatePurchaseOrderDto.safeParse(updateData);
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

    const userId = session.user?.userId || 0;
    const po = await service.updatePurchaseOrder(po_id, parsed.data, userId);
    return NextResponse.json(po);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}