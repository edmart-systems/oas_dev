import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../db/db";
import { UnitService } from "@/modules/inventory/services/unit.services";
import { UnitRepository } from "@/modules/inventory/repositories/unit.repository";
import { UnitDto } from "@/modules/inventory/dtos/unit.dto";
import { getServerSession } from "next-auth";
import { SessionService } from "@/services/auth-service/session.service";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";

const service = new UnitService(new UnitRepository(prisma));
const sessionService = new SessionService();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  const body = await req.json();
  const parsed = UnitDto.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.values(fieldErrors).flat().join(", ");
    return NextResponse.json({ message: errorMessages || "Invalid input" }, { status: 400 });
  }

  try {
    const updated = await service.updateUnit(id, parsed.data);
    return NextResponse.json({ updated, message: `Unit '${updated.name}' updated successfully` }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  try {
    const deleted = await prisma.unit.delete({ where: { unit_id: id } });
    return NextResponse.json({ message: `Unit '${deleted.name}' permanently deleted.` }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 400 });
  }
}
