import { SupplierRepository } from "@/modules/inventory/repositories/supplier.repository";
import { SupplierService } from "@/modules/inventory/services/supplier.service";
import prisma from "../../../../../../db/db";
import { SessionService } from "@/services/auth-service/session.service";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { UpdateSupplierDto } from "@/modules/inventory/dtos/supplier.dto";




const service = new SupplierService(new SupplierRepository(prisma));
const sessionService = new SessionService


export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  

  const id = Number(params.id);
  const body = await req.json();


  const supplierData = {
    ...body,  
    updated_by: session.user?.email || session.user?.userId || "unknown",}

  const parsed = UpdateSupplierDto.safeParse(supplierData);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const updated = await service.updateSupplier(id, parsed.data);
        return NextResponse.json(
          {
            updated,
            message: `Supplier '${updated.supplier_name}' updated successfully`,
          },
          { status: 200 }
        );
  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const deleted = await prisma.supplier.delete({
      where: { supplier_id: id },
    });

    return NextResponse.json(
      { message: `Supplier '${deleted.supplier_name}' permanently deleted.` },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 400 }
    );
  }
}

