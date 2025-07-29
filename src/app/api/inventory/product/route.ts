import { NextRequest, NextResponse } from "next/server";
import { CreateProductDto } from "@/modules/inventory/dtos/product.dto";
import { ProductRepository } from "@/modules/inventory/repositories/product.repository";
import { ProductService } from "@/modules/inventory/services/product.service";
import prisma from "../../../../../db/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";

const service = new ProductService(new ProductRepository(prisma));
const sessionService = new SessionService



export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if(!session || !(await sessionService.checkIsUserSessionOk(session))){
    return NextResponse.json({error: "Unauthorized"},{status:401});
  }
      
  const body = await req.json();

  const productData = {
      ...body,
      created_by: session.user?.email || session.user?.userId || "unknown",
  };

  const parsed = CreateProductDto.safeParse(productData);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const newProduct = await service.createProduct(parsed.data);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await service.getAllProducts();
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
