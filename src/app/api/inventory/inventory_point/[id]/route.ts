import { NextRequest, NextResponse } from "next/server";
import { LocationService } from "@/modules/inventory/services/location.service";
import { UpdateLocationSchema } from "@/modules/inventory/dtos/location.dto";
import { getServerSession } from "next-auth";
import { SessionService } from "@/services/auth-service/session.service";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";

const service = new LocationService();
const sessionService = new SessionService();

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

  const locationData = {
    ...body,
    updated_by: session.user?.co_user_id || "unknown",
  };

  const parsed = UpdateLocationSchema.safeParse(locationData);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const updated = await service.updateLocation(id, parsed.data);
    return NextResponse.json(
      {
        updated,
        message: `Location '${updated.location_name}' updated successfully`,
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
    const deleted = await service.deleteLocation(id);
    return NextResponse.json(
      { message: `Location '${deleted.location_name}' permanently deleted.` },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 400 }
    );
  }
}