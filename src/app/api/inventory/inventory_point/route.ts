import { LocationRepository } from "@/modules/inventory/repositories/location.repository";
import { LocationService } from "@/modules/inventory/services/location.service";
import { PrismaClient } from "@prisma/client";
import prisma from "../../../../../db/db";

const prismaClient = new PrismaClient();
import { NextRequest, NextResponse } from "next/server";
import { CreateLocationSchema } from "@/modules/inventory/dtos/location.dto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";


const service = new LocationService();
const sessionService = new SessionService

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    
    const locationData = {
      ...body,
      created_by: session.user?.co_user_id || "unknown",
    };

    const parsed = CreateLocationSchema.safeParse(locationData);

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
      const newLocation = await service.createLocation(parsed.data, session.user.role_id as 1 | 2);
    return NextResponse.json(
      { message: "Location created successfully", data: newLocation },
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
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role 2 users only see INVENTORY_POINT locations, Role 1 sees all
    const locations = session.user.role_id === 2 
      ? await service.getLocationsByType("INVENTORY_POINT")
      : await service.getAllLocations();

    // Add creator and assigned user information to each location
    const locationsWithCreator = await Promise.all(
      locations.map(async (location: any) => {
        let creator = null;
        let assigned_user = null;
        
        if (location.created_by) {
          creator = await prismaClient.user.findUnique({
            where: { co_user_id: location.created_by },
            select: { firstName: true, lastName: true, co_user_id: true }
          });
        }
        
        if (location.assigned_to) {
          assigned_user = await prismaClient.user.findUnique({
            where: { co_user_id: location.assigned_to },
            select: { firstName: true, lastName: true, co_user_id: true }
          });
        }
        
        return { ...location, creator, assigned_user };
      })
    );

    return NextResponse.json(locationsWithCreator);
  } catch (err: any) {
    console.error('Inventory Point API Error:', err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}