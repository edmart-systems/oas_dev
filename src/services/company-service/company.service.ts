import { logger } from "@/logger/default-logger";
import prisma from "../../../db/db";
import { CompanyRepository } from "./company.repository";
import { CompanyDto } from "@/types/company.types";

export class CompanyService {
  companyRepo = new CompanyRepository(prisma);
  constructor() {}

  getCompanyDetails = async (): Promise<CompanyDto> => {
    try {
      const companyDetails: CompanyDto =
        await this.companyRepo.fetchCompanyDetails();

      return Promise.resolve(companyDetails);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };
}
