import { Inventory_pointRepository } from "@/modules/inventory/repositories/inventory_point.repository";
import { Inventory_pointService } from "@/modules/inventory/services/inventory_point.service";
import prisma from "../../../../../db/db";
import { NextRequest, NextResponse } from "next/server";
import { Inventory_pointDto } from "@/modules/inventory/dtos/inventory_point.dto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";


const service = new Inventory_pointService(new Inventory_pointRepository(prisma));
const sessionService = new SessionService

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    
    const inventory_pointData = {
      ...body,
      created_by: session.user?.co_user_id || "unknown",
    };

    const parsed = Inventory_pointDto.safeParse(inventory_pointData);

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
      const newInventory_point = await service.createInventory_point(parsed.data);
    return NextResponse.json(
      { message: "Inventory_point created successfully", data: newInventory_point },
      { status: 201 }
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
    const session = await sessionService.checkIsUserSessionOk(await getServerSession(authOptions));
    const inventory_points = await service.getAllInventory_points();
    if(!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); 
    }
    return NextResponse.json(inventory_points);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}