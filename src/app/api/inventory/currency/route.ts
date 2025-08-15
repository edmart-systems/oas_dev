import { NextResponse } from 'next/server';
import prisma from "../../../../../db/db";

export async function GET() {
  try {
    const currencies = await prisma.currency.findMany();
    return NextResponse.json(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { currency_code, currency_name } = await request.json();
    
    const currency = await prisma.currency.create({
      data: {
        currency_code,
        currency_name,
      },
    });
    
    return NextResponse.json(currency);
  } catch (error) {
    console.error('Error creating currency:', error);
    return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 });
  }
}