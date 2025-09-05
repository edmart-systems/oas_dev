import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../db/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";

const sessionService = new SessionService();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !(await sessionService.checkIsUserSessionOk(session)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json();

  try {
    const updated = await prisma.order.update({
      where: { order_id: id },
      data: { ...body, updated_by: session.user?.co_user_id || "unknown" },
    });
    return NextResponse.json({ updated, message: `Order '${updated.order_number}' updated successfully` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !(await sessionService.checkIsUserSessionOk(session)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  try {
    await prisma.orderItem.deleteMany({ where: { order_id: id } });
    const deleted = await prisma.order.delete({ where: { order_id: id } });
    return NextResponse.json({ message: `Order '${deleted.order_number}' permanently deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 400 });
  }
}
