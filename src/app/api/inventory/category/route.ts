import { CategoryRepository } from "@/modules/inventory/repositories/category.repository";
import { CategoryService } from "@/modules/inventory/services/category.services";
import prisma from "../../../../../db/db";
import { NextRequest, NextResponse } from "next/server";
import { CategoryDto } from "@/modules/inventory/dtos/category.dto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";


const service = new CategoryService(new CategoryRepository(prisma));
const sessionService = new SessionService

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }

    const body = await req.json();

    
    const categoryData = {
      ...body,
      created_by: session.user?.co_user_id || "unknown",
    };

    const parsed = CategoryDto.safeParse(categoryData);

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

    try{
      const newCategory = await service.createCategory(parsed.data);
      return NextResponse.json(
        { message: "Category created successfully", data: newCategory },
        { status: 200 }
      );
    }catch(err:any){
      return NextResponse.json(
        {error: err.message || "Internal Server Error" },
        { status: 400 }
      );
    }

    
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    const categorys = await service.getAllCategorys();
    return NextResponse.json(categorys);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}