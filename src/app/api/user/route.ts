import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    
    const users = await prisma.user.findMany({
      where: role ? { role_id: parseInt(role) } : undefined,
      select: {
        userId: true,
        co_user_id: true,
        firstName: true,
        lastName: true,
        role_id: true,
      },
    });
    
    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}