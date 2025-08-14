import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../db/db";
import { Inventory_pointService } from "@/modules/inventory/services/inventory_point.service";
import { Inventory_pointRepository } from "@/modules/inventory/repositories/inventory_point.repository";
import { Inventory_pointDto } from "@/modules/inventory/dtos/inventory_point.dto";
import { getServerSession } from "next-auth";
import { SessionService } from "@/services/auth-service/session.service";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";

const service = new Inventory_pointService(new Inventory_pointRepository(prisma));
const sessionService = new SessionService

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  const body = await req.json();

  
  const inventory_pointData = {
    ...body,
    updated_by: session.user?.co_user_id || "unknown",
  };

  const parsed = Inventory_pointDto.safeParse(inventory_pointData);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const updated = await service.updateInventory_point(id, parsed.data);
    return NextResponse.json(
      {
        updated,
        message: `Inventory_point '${updated.inventory_point}' updated successfully`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);

  try {
    const deleted = await prisma.inventory_point.delete({
      where: { inventory_point_id: id },
    });

    return NextResponse.json(
      { message: `Inventory_point '${deleted.inventory_point}' permanently deleted.` },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 400 }
    );
  }
}

