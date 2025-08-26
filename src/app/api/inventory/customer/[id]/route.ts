import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../db/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { UpdateCustomerDto } from "@/modules/inventory/dtos/customer.dto";

const sessionService = new SessionService();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  const body = await req.json();
  const payload = { ...body, updated_by: session.user?.co_user_id || "unknown" };

  const parsed = UpdateCustomerDto.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const updated = await prisma.customer.update({ where: { customer_id: id }, data: parsed.data });
    return NextResponse.json({ updated, message: `Customer '${updated.name}' updated successfully` });
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
    const deleted = await prisma.customer.delete({ where: { customer_id: id } });
    return NextResponse.json({ message: `Customer '${deleted.name}' permanently deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 400 });
  }
}
