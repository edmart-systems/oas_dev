import { TagRepository } from "@/modules/inventory/repositories/tag.repositories";
import { TagService } from "@/modules/inventory/services/tag.services";
import prisma from "../../../../../db/db";
import { NextRequest, NextResponse } from "next/server";
import { TagDto } from "@/modules/inventory/dtos/tag.dto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";


const service = new TagService(new TagRepository(prisma));
const sessionService = new SessionService

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Inject logged-in user's email or id here
    const tagData = {
      ...body,
      created_by: session.user?.email || session.user?.userId || "unknown",
    };

    const parsed = TagDto.safeParse(tagData);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newTag = await service.createTag(parsed.data);
    return NextResponse.json(
      { message: "Tag created successfully", data: newTag },
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
    const tags = await service.getAllTags();
    return NextResponse.json(tags);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}