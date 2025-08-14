import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../db/db";
import { CategoryService } from "@/modules/inventory/services/category.services";
import { CategoryRepository } from "@/modules/inventory/repositories/category.repository";
import { CategoryDto } from "@/modules/inventory/dtos/category.dto";
import { getServerSession } from "next-auth";
import { SessionService } from "@/services/auth-service/session.service";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";

const service = new CategoryService(new CategoryRepository(prisma));
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

  
  const categoryData = {
    ...body,
    updated_by: session.user?.email || session.user?.userId || "unknown",
  };

  const parsed = CategoryDto.safeParse(categoryData);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const updated = await service.updateCategory(id, parsed.data);
    return NextResponse.json(
      {
        updated,
        message: `Category '${updated.category}' updated successfully`,
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
    const deleted = await prisma.category.delete({
      where: { category_id: id },
    });

    return NextResponse.json(
      { message: `Category '${deleted.category}' permanently deleted.` },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 400 }
    );
  }
}

