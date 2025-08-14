'use server';

import prisma from "../../../db/db";

export async function getUnits() {
  try {
    const units = await prisma.unit.findMany({
      select: {
        unit_id: true,
        name: true,
      },
    });
    return units.map(unit => ({ id: unit.unit_id, name: unit.name }));
  } catch (error) {
    console.error('Failed to fetch units:', error);
    return [];
  }
}

export async function getCurrencies() {
  try {
    const currencies = await prisma.currency.findMany({
      select: {
        currency_id: true,
        currency_code: true,
        currency_name: true,
      },
    });
    return currencies;
  } catch (error) {
    console.error('Failed to fetch currencies:', error);
    return [];
  }
}