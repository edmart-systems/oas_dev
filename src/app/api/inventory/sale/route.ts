import { SaleRepository } from "@/modules/inventory/repositories/sale.repository";
import { SaleItemRepository } from "@/modules/inventory/repositories/sale_item.repository";
import { SaleService } from "@/modules/inventory/services/sale.service";        
import { SaleDto } from "@/modules/inventory/dtos/sale.dto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";   

import { SessionService } from "@/services/auth-service/session.service";
import { PrismaClient } from "@prisma/client";  

const prisma = new PrismaClient();
const saleRepo = new SaleRepository(prisma);
const saleItemRepo = new SaleItemRepository(prisma);
const service = new SaleService(prisma, saleRepo, saleItemRepo);
const sessionService = new SessionService;


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
      sale_created_by: session.user?.email || session.user?.userId || "unknown",
    };

    const parsed = SaleDto.safeParse(tagData);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newSale = await service.createSale(parsed.data);
    return NextResponse.json(
      { message: "Sale created successfully", data: newSale },
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
    const sales = await service.getAllSales();
    return NextResponse.json(sales);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}