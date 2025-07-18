import { logger } from "@/logger/default-logger";
import { CompanyDto } from "@/types/company.types";
import { PrismaClient } from "@prisma/client";

export class CompanyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  fetchCompanyDetails = async (): Promise<CompanyDto> => {
    try {
      const company = await this.prisma.company.findFirst({
        include: {
          addresses: true,
        },
      });

      if (!company) {
        return Promise.reject("Company Not Found");
      }

      const {
        addresses,
        created_at: coCreatedAt,
        updated_at: coUpdatedAt,
        ...companyRest
      } = company;
      const { created_at, updated_at, ...addressRest } = addresses[0];

      return { ...companyRest, address: addressRest };
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };
}
