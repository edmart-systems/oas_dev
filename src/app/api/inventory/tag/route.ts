import { TagRepository } from "@/modules/inventory/repositories/tag.repository";
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const body = await req.json();

    const tagData = {
      ...body,
      created_by: session.user?.co_user_id || "unknown",
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
      const newTag = await service.createTag(parsed.data);
      return NextResponse.json(
        { message: "Tag created successfully", data: newTag },
        { status: 200 }
      );
    } catch (err: any) {
      
      return NextResponse.json(
        { message: err.message || "Internal Server Error" },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    const session = await sessionService.checkIsUserSessionOk(await getServerSession(authOptions));
    const tags = await service.getAllTags();
    if(!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); 
    }
    return NextResponse.json(tags);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}