import { NextRequest, NextResponse } from "next/server";
import { SupplierDto } from "@/modules/inventory/dtos/supplier.dto";
import { SupplierRepository } from "@/modules/inventory/repositories/supplier.repository";
import { SupplierService} from "@/modules/inventory/services/supplier.service";
import prisma from "../../../../../db/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";  
import { SessionService } from "@/services/auth-service/session.service";
    


const service = new SupplierService(new SupplierRepository(prisma));
const sessionService = new SessionService();



export async function POST(req: NextRequest) {
  try{

  const session = await getServerSession(authOptions);
  if(!session || !(await sessionService.checkIsUserSessionOk(session))){
    return NextResponse.json({error: "Unauthorized"},{status:401});
  }
      
  const body = await req.json();

  const supplierData = {
    ...body,
    created_by: session.user?.co_user_id || "unknown",
  };

  const parsed = SupplierDto.safeParse(supplierData);

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
    const newSupplier = await service.createSupplier(parsed.data);
    return NextResponse.json({message: "Supplier created successfully", data: newSupplier },
      {status: 200} 
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 400 });
  } }catch(err:any){
    return NextResponse.json({error: err.message || "Internal Server Error"}, {status: 500});
  }
}



export async function GET() {
  try {
    const session = await sessionService.checkIsUserSessionOk(await getServerSession(authOptions));
    const suppliers = await service.getAllSuppliers();  
    if(!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); 
    }
    return NextResponse.json(suppliers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}   