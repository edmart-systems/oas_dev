import { Inventory_pointRepository } from "@/modules/inventory/repositories/inventory_point.repository";
import { Inventory_pointService } from "@/modules/inventory/services/inventory_point.service";
import prisma from "../../../../../db/db";
import { NextRequest, NextResponse } from "next/server";
import { Inventory_pointDto } from "@/modules/inventory/dtos/inventory_point.dto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";


const service = new Inventory_pointService(new Inventory_pointRepository(prisma));
const sessionService = new SessionService

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Inject logged-in user's co_user_id here
    const inventory_pointData = {
      ...body,
      created_by: session.user?.co_user_id || "unknown",
    };

    const parsed = Inventory_pointDto.safeParse(inventory_pointData);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newInventory_point = await service.createInventory_point(parsed.data);
    return NextResponse.json(
      { message: "Inventory_point created successfully", data: newInventory_point },
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
    const inventory_points = await service.getAllInventory_points();
    return NextResponse.json(inventory_points);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}