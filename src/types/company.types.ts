import { Bank, Company, Company_address } from "@prisma/client";

export type CompanyAddressDTO = Omit<
  Company_address,
  "created_at" | "updated_at"
>;

export type CompanyDto = Omit<Company, "created_at" | "updated_at"> & {
  address: CompanyAddressDTO;
};

export type BankDto = Omit<Bank, "created_at" | "updated_at">;
