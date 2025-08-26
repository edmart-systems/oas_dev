import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../db/db";
import { CustomerDto } from "@/modules/inventory/dtos/customer.dto";
import { CustomerRepository } from "@/modules/inventory/repositories/customer.repository";
import { CustomerService } from "@/modules/inventory/services/customer.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";

const service = new CustomerService(new CustomerRepository(prisma));
const sessionService = new SessionService();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await sessionService.checkIsUserSessionOk(session)))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const payload = { ...body, created_by: session.user?.co_user_id || "unknown" };

    const parsed = CustomerDto.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const msg = Object.values(fieldErrors).flat().join(", ");
      return NextResponse.json({ message: msg || "Invalid input" }, { status: 400 });
    }

    const created = await service.createCustomer(parsed.data);
    return NextResponse.json({ message: "Customer created successfully", data: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ok = await sessionService.checkIsUserSessionOk(await getServerSession(authOptions));
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const customers = await service.getAllCustomers();
    return NextResponse.json(customers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
