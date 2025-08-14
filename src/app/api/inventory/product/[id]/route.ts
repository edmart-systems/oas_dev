import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import { UpdateProductDto } from "@/modules/inventory/dtos/product.dto";
import { ProductService } from "@/modules/inventory/services/product.service";
import { ProductRepository } from "@/modules/inventory/repositories/product.repository";
import prisma from "../../../../../../db/db";


const productService = new ProductService(new ProductRepository(prisma));

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const body = await req.json();
  const productData = {
      ...body,
      updated_by: session.user?.email || session.user?.userId || "unknown",
    };
  const parsed = UpdateProductDto.safeParse(productData);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format }, { status: 400 });
  }

  try {
    const updated = await productService.updateProduct(id, parsed.data);
    return NextResponse.json({ message: "Product updated", updated });
  } catch (err: any) {
    if (err.message === "Product not found") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    await productService.deleteProduct(id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err: any) {
    if (err.message === "Product not found") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
