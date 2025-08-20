'use server';

import { CompanyDto } from "@/types/company.types";
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

export async function getCompany(): Promise<CompanyDto | null> {
  try {
    const company = await prisma.company.findFirst({
      include: {
        addresses: true, // this will return an array
      },
    });

    if (!company) return null;

    // pick the first address (or you could choose based on branch_name etc.)
    const address = company.addresses[0] || null;

    return {
      co_id: company.co_id,
      legal_name: company.legal_name,
      business_name: company.business_name,
      tin: company.tin,
      email: company.email,
      phone_number_1: company.phone_number_1,
      phone_number_2: company.phone_number_2,
      landline_number: company.landline_number,
      logo: company.logo,
      web: company.web,
      address: address
        ? {
            co_id: address.co_id,
            co_ad_id: address.co_ad_id,
            branch_number: address.branch_number,
            branch_name: address.branch_name,
            box_number: address.box_number,
            street: address.street,
            plot_number: address.plot_number,
            building_name: address.building_name,
            floor_number: address.floor_number,
            room_number: address.room_number,
            country: address.country,
            district: address.district,
          }
        : ({} as any),
    };
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}