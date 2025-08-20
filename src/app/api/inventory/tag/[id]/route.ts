import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../db/db";
import { TagService } from "@/modules/inventory/services/tag.services";
import { TagRepository } from "@/modules/inventory/repositories/tag.repository";
import { TagDto } from "@/modules/inventory/dtos/tag.dto";
import { getServerSession } from "next-auth";
import { SessionService } from "@/services/auth-service/session.service";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";

const service = new TagService(new TagRepository(prisma));
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

  
  const tagData = {
    ...body,
    updated_by: session.user?.co_user_id || "unknown",
  };

  const parsed = TagDto.safeParse(tagData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors)
        .flat()
        .join(", ");
      return NextResponse.json(
        { message: errorMessages || "Invalid input" },
        { status: 400 }
      );
  }

  try {
    const updated = await service.updateTag(id, parsed.data);
    return NextResponse.json(
      {
        updated,
        message: `Tag '${updated.tag}' updated successfully`,
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
    const deleted = await prisma.tag.delete({
      where: { tag_id: id },
    });

    return NextResponse.json(
      { message: `Tag '${deleted.tag}' permanently deleted.` },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 400 }
    );
  }
}

