import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../db/db";
import { UnitService } from "@/modules/inventory/services/unit.services";
import { UnitRepository } from "@/modules/inventory/repositories/unit.repository";
import { UnitDto } from "@/modules/inventory/dtos/unit.dto";
import { getServerSession } from "next-auth";
import { SessionService } from "@/services/auth-service/session.service";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";

const service = new UnitService(new UnitRepository(prisma));
const sessionService = new SessionService();

export async function GET() {
  try {
    const sessionOk = await sessionService.checkIsUserSessionOk(
      await getServerSession(authOptions)
    );
    if (!sessionOk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const units = await service.getAllUnits();
    return NextResponse.json(units);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionOk = await sessionService.checkIsUserSessionOk(session);
    if (!session || !sessionOk) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = UnitDto.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors).flat().join(", ");
      return NextResponse.json(
        { message: errorMessages || "Invalid input" },
        { status: 400 }
      );
    }

    const created = await service.createUnit(parsed.data);
    return NextResponse.json(
      { message: `Unit '${created.name}' created successfully`, data: created },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 });
  }
}
