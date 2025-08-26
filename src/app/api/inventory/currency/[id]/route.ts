import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../db/db";
import { getServerSession } from "next-auth";
import { SessionService } from "@/services/auth-service/session.service";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";

const sessionService = new SessionService();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  const body = await req.json();
  const { currency_code, currency_name } = body;

  if (!currency_code || !currency_name) {
    return NextResponse.json({ message: "currency_code and currency_name are required" }, { status: 400 });
  }

  try {
    const updated = await prisma.currency.update({
      where: { currency_id: id },
      data: { currency_code, currency_name },
    });
    return NextResponse.json({ updated, message: `Currency '${updated.currency_code}' updated successfully` }, { status: 200 });
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
    const deleted = await prisma.currency.delete({ where: { currency_id: id } });
    return NextResponse.json({ message: `Currency '${deleted.currency_code}' permanently deleted.` }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 400 });
  }
}
