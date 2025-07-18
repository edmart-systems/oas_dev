import { logger } from "@/logger/default-logger";
import { Currency2 } from "@/types/currency.types";
import {
  FullQuotation,
  NewRawQuotation,
  PaginatedQuotations,
  PaginatedQuotationsParameter,
  QuotationFilters,
  QuotationInputClientData,
  QuotationOutputLineItem,
  QuotationStatusKey,
  QuotationStatusCounts,
  SummarizedQuotation,
  TcsDto,
  Unit2,
  NewRawEditQuotation,
  EditedSummarizedQuotation,
  QuotationId,
  QuotationsForRemainder,
  QuotationTaggedUser,
  NewQuotation,
} from "@/types/quotations.types";
import {
  daysToMilliseconds,
  hoursToMilliseconds,
} from "@/utils/time-converters.utils";
import { userNameFormatter } from "@/utils/formatters.util";
import { getPaginationData } from "@/utils/pagination.utils";
import { isDateExpired } from "@/utils/time.utils";
import {
  Edited_quotation,
  Prisma,
  PrismaClient,
  Quotation,
  Quotation_category,
  Quotation_client_data,
  Quotation_items,
  Quotation_status,
  Quotation_tagged_users,
  Quotation_type,
  Unit,
} from "@prisma/client";

export class QuotationsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  fetchQuotationTypes = async (): Promise<Quotation_type[]> => {
    try {
      const quotationTypes = await this.prisma.quotation_type.findMany();
      return Promise.resolve(quotationTypes);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchQuotationCategories = async (): Promise<Quotation_category[]> => {
    try {
      const quotationCategories =
        await this.prisma.quotation_category.findMany();
      return Promise.resolve(quotationCategories);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchQuotationTcs = async (): Promise<TcsDto[]> => {
    try {
      const tcs = await this.prisma.quotation_tcs.findMany({
        include: {
          bank: true,
        },
      });

      const formattedTcs: TcsDto[] = [];

      for (const tc of tcs) {
        const { bank, created_at, updated_at, ...tcsRest } = tc;
        formattedTcs.push({
          ...tcsRest,
          edited_delivery_days: tcsRest.delivery_days,
          edited_validity_days: tcsRest.validity_days,
          edited_payment_grace_days: tcsRest.payment_grace_days,
          edited_initial_payment_percentage: tcsRest.initial_payment_percentage,
          edited_last_payment_percentage: tcsRest.last_payment_percentage,
          bank,
        });
      }

      return Promise.resolve(formattedTcs);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchUnits2 = async (): Promise<Unit2[]> => {
    try {
      const units = await this.prisma.unit.findMany();

      const formattedUnits: Unit2[] = [];

      for (const unit of units) {
        const { updated_at, created_at, unit_desc, ...unitRest } = unit;
        formattedUnits.push({
          ...unitRest,
        });
      }

      return Promise.resolve(formattedUnits);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchCurrencies2 = async (): Promise<Currency2[]> => {
    try {
      const currencies = await this.prisma.currency.findMany();

      const formattedCurrencies: Currency2[] = [];

      for (const item of currencies) {
        const { updated_at, created_at, ...rest } = item;
        formattedCurrencies.push({
          ...rest,
        });
      }

      return Promise.resolve(formattedCurrencies);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchSingleFullQuotation = async (
    quotationId: string
  ): Promise<Omit<FullQuotation, "signature"> | null> => {
    try {
      const quotation = await this.prisma.quotation.findUnique({
        where: {
          quotation_id: quotationId,
        },
        include: {
          user: {
            select: {
              co_user_id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              profile_picture: true,
            },
          },
          client_data: true,
          lineItems: true,
          currency: {
            select: {
              currency_id: true,
              currency_code: true,
              currency_name: true,
            },
          },
          quotationStatus: true,
          quotationType: true,
          quotationCategory: true,
          tcs: {
            include: { bank: true },
          },
          quotationTaggedUsers: true,
        },
      });

      if (!quotation) return Promise.resolve(null);

      const quotationType = quotation.quotationType;
      const quotationCategory = quotation.quotationCategory;

      const {
        created_at: tcsCat,
        updated_at: tcsUat,
        ...tcsRest
      } = quotation.tcs;

      const tcs: TcsDto = {
        ...tcsRest,
        validity_days: quotation.validity_days,
        payment_grace_days: quotation.payment_grace_days,
        initial_payment_percentage: quotation.initial_payment_percentage,
        last_payment_percentage: quotation.last_payment_percentage,
        edited_delivery_days: tcsRest.delivery_days,
        edited_validity_days: quotation.validity_days,
        edited_payment_grace_days: quotation.payment_grace_days,
        edited_initial_payment_percentage: quotation.initial_payment_percentage,
        edited_last_payment_percentage: quotation.last_payment_percentage,
      };

      const currency: Currency2 = quotation.currency;

      const clientData: QuotationInputClientData = {
        name: quotation.client_data.name,
        ref: quotation.client_data.external_ref,
        contactPerson: quotation.client_data.contact_person,
        email: quotation.client_data.email,
        phone: quotation.client_data.phone,
        boxNumber: quotation.client_data.box_number,
        country: quotation.client_data.country,
        city: quotation.client_data.city,
        addressLine1: quotation.client_data.address_Line_1,
      };

      const lineItems: QuotationOutputLineItem[] = [];

      for (const item of quotation.lineItems) {
        lineItems.push({
          id: item.item_id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          units: item.units,
          unitPrice: item.unitPrice,
        });
      }

      const user = quotation.user;

      const createdAt = Number(quotation.time);
      const expiryTime =
        createdAt + daysToMilliseconds(quotation.validity_days);
      const isExpired = isDateExpired(expiryTime);

      const fullQuotation: Omit<FullQuotation, "signature"> = {
        id: quotation.id,
        quotationId: quotation.quotation_id,
        time: createdAt,
        createdTime: createdAt,
        type: quotationType,
        category: quotationCategory,
        tcsEdited: quotation.tcs_edited === 1,
        vatExcluded: quotation.vat_excluded === 1,
        tcs: tcs,
        currency: currency,
        clientData: clientData,
        lineItems: lineItems,
        user: user,
        expiryTime: expiryTime,
        isExpired: isExpired,
        subTotal: quotation.sub_total,
        vat: quotation.vat,
        grandTotal: quotation.grand_total,
        status: quotation.quotationStatus,
        edited: Boolean(quotation.edited),
        isVariant: false,
        taggedUsers: this.formatQuotationTaggedUsers(
          quotation.quotationTaggedUsers
        ),
      };

      return Promise.resolve(fullQuotation);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchEditedSingleFullQuotation = async (
    _quotationId: QuotationId
  ): Promise<Omit<FullQuotation, "signature"> | null> => {
    try {
      const quotation = await this.prisma.edited_quotation.findUnique({
        where: {
          id: _quotationId.quotationId,
          quotation_id: _quotationId.quotationNumber,
        },
        include: {
          user: {
            select: {
              co_user_id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              profile_picture: true,
            },
          },
          client_data: true,
          lineItems: true,
          currency: {
            select: {
              currency_id: true,
              currency_code: true,
              currency_name: true,
            },
          },
          quotationStatus: true,
          quotationType: true,
          quotationCategory: true,
          tcs: {
            include: { bank: true },
          },
          quotationTaggedUsers: true,
        },
      });

      if (!quotation) return Promise.resolve(null);

      const quotationType = quotation.quotationType;
      const quotationCategory = quotation.quotationCategory;

      const {
        created_at: tcsCat,
        updated_at: tcsUat,
        ...tcsRest
      } = quotation.tcs;

      const tcs: TcsDto = {
        ...tcsRest,
        validity_days: quotation.validity_days,
        payment_grace_days: quotation.payment_grace_days,
        initial_payment_percentage: quotation.initial_payment_percentage,
        last_payment_percentage: quotation.last_payment_percentage,
        edited_delivery_days: tcsRest.delivery_days,
        edited_validity_days: quotation.validity_days,
        edited_payment_grace_days: quotation.payment_grace_days,
        edited_initial_payment_percentage: quotation.initial_payment_percentage,
        edited_last_payment_percentage: quotation.last_payment_percentage,
      };

      const currency: Currency2 = quotation.currency;

      const clientData: QuotationInputClientData = {
        name: quotation.client_data.name,
        ref: quotation.client_data.external_ref,
        contactPerson: quotation.client_data.contact_person,
        email: quotation.client_data.email,
        phone: quotation.client_data.phone,
        boxNumber: quotation.client_data.box_number,
        country: quotation.client_data.country,
        city: quotation.client_data.city,
        addressLine1: quotation.client_data.address_Line_1,
      };

      const lineItems: QuotationOutputLineItem[] = [];

      for (const item of quotation.lineItems) {
        lineItems.push({
          id: item.item_id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          units: item.units,
          unitPrice: item.unitPrice,
        });
      }

      const user = quotation.user;

      const createdAt = Number(quotation.time);
      const expiryTime =
        createdAt + daysToMilliseconds(quotation.validity_days);
      const isExpired = isDateExpired(expiryTime);

      const fullQuotation: Omit<FullQuotation, "signature"> = {
        id: quotation.id,
        quotationId: quotation.quotation_id,
        time: createdAt,
        createdTime: Number(quotation.created_time),
        type: quotationType,
        category: quotationCategory,
        tcsEdited: quotation.tcs_edited === 1,
        vatExcluded: quotation.vat_excluded === 1,
        tcs: tcs,
        currency: currency,
        clientData: clientData,
        lineItems: lineItems,
        user: user,
        expiryTime: expiryTime,
        isExpired: isExpired,
        subTotal: quotation.sub_total,
        vat: quotation.vat,
        grandTotal: quotation.grand_total,
        status: quotation.quotationStatus,
        edited: Boolean(false),
        isVariant: true,
        taggedUsers: this.formatQuotationTaggedUsers(
          quotation.quotationTaggedUsers
        ),
      };

      return Promise.resolve(fullQuotation);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchSingleBaseQuotation = async (
    quotationId: string
  ): Promise<Quotation | null> => {
    try {
      const quotation = await this.prisma.quotation.findUnique({
        where: {
          quotation_id: quotationId,
        },
      });

      if (!quotation) return Promise.resolve(null);
      return Promise.resolve(quotation);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchEditedSingleBaseQuotation = async (
    _quotationId: QuotationId
  ): Promise<Edited_quotation | null> => {
    try {
      const quotation = await this.prisma.edited_quotation.findUnique({
        where: {
          id: _quotationId.quotationId,
          quotation_id: _quotationId.quotationNumber,
        },
      });

      if (!quotation) return Promise.resolve(null);
      return Promise.resolve(quotation);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchQuotationStatusByName = async (
    status: QuotationStatusKey
  ): Promise<Quotation_status | null> => {
    try {
      const quotationStatus = await this.prisma.quotation_status.findFirst({
        where: {
          status: status,
        },
      });

      if (!quotationStatus) return Promise.resolve(null);

      return Promise.resolve(quotationStatus);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  countExistingMonthQuotations = async (startTime: number): Promise<number> => {
    try {
      const quotationsCount = await this.prisma.quotation.count({
        where: {
          time: {
            gte: BigInt(startTime),
          },
        },
      });

      return Promise.resolve(quotationsCount);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  recordNewQuotation = async ({
    clientData,
    quotationData,
    lineItems,
  }: NewRawQuotation): Promise<Quotation> => {
    try {
      const createdQuotation: Quotation = await this.prisma.$transaction(
        async (txn): Promise<Quotation> => {
          const client = await txn.quotation_client_data.create({
            data: clientData,
          });

          const quotation: Quotation = await txn.quotation.create({
            data: { ...quotationData, client_data_id: client.client_id },
          });

          const formattedItems = lineItems.map((item) => ({
            ...item,
            quot_id: quotation.id,
          }));

          const items = await txn.quotation_items.createMany({
            data: formattedItems,
          });

          return Promise.resolve(quotation);
        }
      );
      return Promise.resolve(createdQuotation);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  recordNewEditQuotation = async ({
    clientData,
    quotationData,
    lineItems,
  }: NewRawEditQuotation): Promise<Edited_quotation> => {
    try {
      const editedQuotation: Edited_quotation = await this.prisma.$transaction(
        async (txn): Promise<Edited_quotation> => {
          const client = await txn.quotation_client_data.create({
            data: clientData,
          });

          const editedQuotation: Edited_quotation =
            await txn.edited_quotation.create({
              data: { ...quotationData, client_data_id: client.client_id },
            });

          const formattedItems = lineItems.map((item) => ({
            ...item,
            edited_quot_id: editedQuotation.id,
          }));

          const items = await txn.quotation_items.createMany({
            data: formattedItems,
          });

          const originalQuotation: Quotation = await txn.quotation.update({
            where: { quotation_id: quotationData.quotation_id },
            data: { edited: 1 },
          });

          return Promise.resolve(editedQuotation);
        }
      );
      return Promise.resolve(editedQuotation);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchQuotationStatusCount = async ({
    isAdmin,
    userId,
  }: {
    isAdmin: boolean;
    userId: string;
  }): Promise<QuotationStatusCounts> => {
    try {
      const countsMain = await this.prisma.$queryRaw<
        {
          status: QuotationStatusKey;
          count: number;
        }[]
      >`
	SELECT quotation_status.status, COALESCE(COUNT(quotation.status_id), 0) AS count 
	FROM quotation_status LEFT JOIN quotation ON quotation.status_id = quotation_status.status_id 
	WHERE quotation_status.status 
	IN ('created', 'sent', 'accepted', 'rejected', 'expired') 
	GROUP BY quotation_status.status 
	order by quotation_status.status asc;
			`;

      const countsVariants = await this.prisma.$queryRaw<
        {
          status: QuotationStatusKey;
          count: number;
        }[]
      >`
	SELECT quotation_status.status, COALESCE(COUNT(edited_quotation.status_id), 0) AS count 
	FROM quotation_status LEFT JOIN edited_quotation ON edited_quotation.status_id = quotation_status.status_id 
	WHERE quotation_status.status 
	IN ('created', 'sent', 'accepted', 'rejected', 'expired') 
	GROUP BY quotation_status.status 
	order by quotation_status.status asc;
			`;

      const blankCount = {
        count: 0,
      };

      const statusCount: QuotationStatusCounts = {
        created: blankCount,
        accepted: blankCount,
        rejected: blankCount,
        expired: blankCount,
        sent: blankCount,
        all: blankCount,
      };

      for (const statusSum of [...countsMain, ...countsVariants]) {
        const { count, status } = statusSum;
        const _count = Number(count);
        statusCount[status] = { count: statusCount[status].count + _count };
        statusCount["all"] = {
          count: statusCount.all.count + _count,
        };
      }

      return Promise.resolve(statusCount);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchPaginatedQuotations = async ({
    userId,
    limit,
    offset,
    filterParams,
  }: PaginatedQuotationsParameter): Promise<PaginatedQuotations> => {
    try {
      const rawQuotations = await this.prisma.quotation.findMany({
        take: limit,
        skip: offset,
        select: {
          id: true,
          time: true,
          quotation_id: true,
          grand_total: true,
          sub_total: true,
          vat: true,
          vat_excluded: true,
          validity_days: true,
          status_id: true,
          edited: true,

          client_data: {
            select: {
              name: true,
              contact_person: true,
              external_ref: true,
            },
          },
          quotationStatus: {
            select: {
              status: true,
              status_id: true,
            },
          },
          currency: {
            select: {
              currency_code: true,
            },
          },
          user: {
            select: {
              co_user_id: true,
              firstName: true,
              lastName: true,
              profile_picture: true,
            },
          },
          quotationCategory: true,
        },
        orderBy: {
          id: "desc",
        },
        where:
          filterParams && this.checkQuotationFilterParams(filterParams)
            ? this.processQuotationFilterParams(filterParams)
            : {},
      });

      const count = await this.prisma.quotation.count({
        where:
          filterParams && this.checkQuotationFilterParams(filterParams)
            ? this.processQuotationFilterParams(filterParams)
            : {},
      });

      const formattedQuotations: SummarizedQuotation[] = [];

      for (const quot of rawQuotations) {
        const createdAt = Number(quot.time);
        const expiryTime = createdAt + daysToMilliseconds(quot.validity_days);
        const isExpired = isDateExpired(expiryTime);
        const wasEdited = Boolean(quot.edited);

        let quotationVariants: EditedSummarizedQuotation[] = [];

        if (wasEdited) {
          quotationVariants = await this.fetchSummarizedEditedQuotationsById(
            quot.quotation_id
          );
        }

        const formatted: SummarizedQuotation = {
          id: quot.id,
          quotationId: quot.quotation_id,
          time: createdAt,
          status_id: quot.status_id,
          status: quot.quotationStatus.status,
          category: quot.quotationCategory.cat,
          external_ref: quot.client_data.external_ref,
          grandTotal: quot.grand_total,
          subtotal: quot.sub_total,
          vat: quot.vat,
          vatExcluded: quot.vat_excluded,
          validityDays: quot.validity_days,
          clientName: quot.client_data.name,
          contactPerson: quot.client_data.contact_person,
          currency: quot.currency.currency_code,
          userId: quot.user.co_user_id,
          userName: userNameFormatter(quot.user.firstName, quot.user.lastName),
          expiryTime: expiryTime,
          isExpired: isExpired,
          profilePic: quot.user.profile_picture,
          edited: wasEdited,
          isVariant: false,
          variants:
            quotationVariants.length > 0 ? quotationVariants : undefined,
        };

        formattedQuotations.push(formatted);
      }

      const paginationData = getPaginationData(offset, limit, count);

      return Promise.resolve({
        quotations: formattedQuotations,
        pagination: paginationData,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchSingleSummarizedQuotation = async (
    id: QuotationId
  ): Promise<SummarizedQuotation | null> => {
    try {
      const rawQuotation = await this.prisma.quotation.findUnique({
        where: {
          quotation_id: id.quotationNumber,
        },
        select: {
          id: true,
          time: true,
          quotation_id: true,
          grand_total: true,
          sub_total: true,
          vat: true,
          vat_excluded: true,
          validity_days: true,
          status_id: true,
          edited: true,

          client_data: {
            select: {
              name: true,
              contact_person: true,
              external_ref: true,
            },
          },
          quotationStatus: {
            select: {
              status: true,
              status_id: true,
            },
          },
          currency: {
            select: {
              currency_code: true,
            },
          },
          user: {
            select: {
              co_user_id: true,
              firstName: true,
              lastName: true,
              profile_picture: true,
            },
          },
          quotationCategory: true,
        },
      });

      if (!rawQuotation) return Promise.resolve(null);

      const createdAt = Number(rawQuotation.time);
      const expiryTime =
        createdAt + daysToMilliseconds(rawQuotation.validity_days);
      const isExpired = isDateExpired(expiryTime);
      const wasEdited = Boolean(rawQuotation.edited);

      let quotationVariants: EditedSummarizedQuotation[] = [];

      if (wasEdited) {
        quotationVariants = await this.fetchSummarizedEditedQuotationsById(
          rawQuotation.quotation_id
        );
      }

      const formatted: SummarizedQuotation = {
        id: rawQuotation.id,
        quotationId: rawQuotation.quotation_id,
        time: createdAt,
        status_id: rawQuotation.status_id,
        status: rawQuotation.quotationStatus.status,
        category: rawQuotation.quotationCategory.cat,
        external_ref: rawQuotation.client_data.external_ref,
        grandTotal: rawQuotation.grand_total,
        subtotal: rawQuotation.sub_total,
        vat: rawQuotation.vat,
        vatExcluded: rawQuotation.vat_excluded,
        validityDays: rawQuotation.validity_days,
        clientName: rawQuotation.client_data.name,
        contactPerson: rawQuotation.client_data.contact_person,
        currency: rawQuotation.currency.currency_code,
        userId: rawQuotation.user.co_user_id,
        userName: userNameFormatter(
          rawQuotation.user.firstName,
          rawQuotation.user.lastName
        ),
        expiryTime: expiryTime,
        isExpired: isExpired,
        profilePic: rawQuotation.user.profile_picture,
        edited: wasEdited,
        isVariant: false,
        variants: quotationVariants.length > 0 ? quotationVariants : undefined,
      };

      return Promise.resolve(formatted);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchSummarizedEditedQuotationsById = async (
    quotationId: string
  ): Promise<EditedSummarizedQuotation[]> => {
    try {
      const rawEditedQuotations = await this.prisma.edited_quotation.findMany({
        where: {
          quotation_id: quotationId,
        },
        select: {
          id: true,
          time: true,
          created_time: true,
          quotation_id: true,
          grand_total: true,
          sub_total: true,
          vat: true,
          vat_excluded: true,
          validity_days: true,
          status_id: true,

          client_data: {
            select: {
              name: true,
              contact_person: true,
              external_ref: true,
            },
          },
          quotationStatus: {
            select: {
              status: true,
              status_id: true,
            },
          },
          currency: {
            select: {
              currency_code: true,
            },
          },
          user: {
            select: {
              co_user_id: true,
              firstName: true,
              lastName: true,
              profile_picture: true,
            },
          },
          quotationCategory: true,
        },
        orderBy: {
          id: "desc",
        },
      });

      const formattedQuotations: EditedSummarizedQuotation[] = [];

      for (const editedQuot of rawEditedQuotations) {
        const assignedTime = Number(editedQuot.time);
        const expiryTime =
          assignedTime + daysToMilliseconds(editedQuot.validity_days);
        const isExpired = isDateExpired(expiryTime);

        const formatted: EditedSummarizedQuotation = {
          id: editedQuot.id,
          quotationId: editedQuot.quotation_id,
          time: assignedTime,
          createdTime: Number(editedQuot.created_time),
          status_id: editedQuot.status_id,
          status: editedQuot.quotationStatus.status,
          category: editedQuot.quotationCategory.cat,
          external_ref: editedQuot.client_data.external_ref,
          grandTotal: editedQuot.grand_total,
          subtotal: editedQuot.sub_total,
          vat: editedQuot.vat,
          vatExcluded: editedQuot.vat_excluded,
          validityDays: editedQuot.validity_days,
          clientName: editedQuot.client_data.name,
          contactPerson: editedQuot.client_data.contact_person,
          currency: editedQuot.currency.currency_code,
          userId: editedQuot.user.co_user_id,
          userName: userNameFormatter(
            editedQuot.user.firstName,
            editedQuot.user.lastName
          ),
          expiryTime: expiryTime,
          isExpired: isExpired,
          profilePic: editedQuot.user.profile_picture,
          isVariant: true,
        };

        formattedQuotations.push(formatted);
      }

      return Promise.resolve(formattedQuotations);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchSingleSummarizedEditedQuotation = async (
    id: QuotationId
  ): Promise<EditedSummarizedQuotation | null> => {
    try {
      const rawEditedQuotation = await this.prisma.edited_quotation.findUnique({
        where: {
          quotation_id: id.quotationNumber,
          id: id.quotationId,
        },
        select: {
          id: true,
          time: true,
          created_time: true,
          quotation_id: true,
          grand_total: true,
          sub_total: true,
          vat: true,
          vat_excluded: true,
          validity_days: true,
          status_id: true,

          client_data: {
            select: {
              name: true,
              contact_person: true,
              external_ref: true,
            },
          },
          quotationStatus: {
            select: {
              status: true,
              status_id: true,
            },
          },
          currency: {
            select: {
              currency_code: true,
            },
          },
          user: {
            select: {
              co_user_id: true,
              firstName: true,
              lastName: true,
              profile_picture: true,
            },
          },
          quotationCategory: true,
        },
      });

      if (!rawEditedQuotation) return Promise.resolve(null);

      const assignedTime = Number(rawEditedQuotation.time);
      const expiryTime =
        assignedTime + daysToMilliseconds(rawEditedQuotation.validity_days);
      const isExpired = isDateExpired(expiryTime);

      const formatted: EditedSummarizedQuotation = {
        id: rawEditedQuotation.id,
        quotationId: rawEditedQuotation.quotation_id,
        time: assignedTime,
        createdTime: Number(rawEditedQuotation.created_time),
        status_id: rawEditedQuotation.status_id,
        status: rawEditedQuotation.quotationStatus.status,
        category: rawEditedQuotation.quotationCategory.cat,
        external_ref: rawEditedQuotation.client_data.external_ref,
        grandTotal: rawEditedQuotation.grand_total,
        subtotal: rawEditedQuotation.sub_total,
        vat: rawEditedQuotation.vat,
        vatExcluded: rawEditedQuotation.vat_excluded,
        validityDays: rawEditedQuotation.validity_days,
        clientName: rawEditedQuotation.client_data.name,
        contactPerson: rawEditedQuotation.client_data.contact_person,
        currency: rawEditedQuotation.currency.currency_code,
        userId: rawEditedQuotation.user.co_user_id,
        userName: userNameFormatter(
          rawEditedQuotation.user.firstName,
          rawEditedQuotation.user.lastName
        ),
        expiryTime: expiryTime,
        isExpired: isExpired,
        profilePic: rawEditedQuotation.user.profile_picture,
        isVariant: true,
      };

      return Promise.resolve(formatted);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateQuotationStatusId = async (
    quotationId: string,
    newStatusId: number
  ): Promise<boolean> => {
    try {
      const updatedQuotation = await this.prisma.quotation.update({
        data: {
          status_id: newStatusId,
        },
        where: {
          quotation_id: quotationId,
        },
      });

      if (!updatedQuotation) return Promise.resolve(false);
      return Promise.resolve(true);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateEditedQuotationStatusId = async (
    _quotationId: QuotationId,
    newStatusId: number
  ): Promise<boolean> => {
    try {
      const updatedQuotation = await this.prisma.edited_quotation.update({
        data: {
          status_id: newStatusId,
        },
        where: {
          id: _quotationId.quotationId,
          quotation_id: _quotationId.quotationNumber,
        },
      });

      if (!updatedQuotation) return Promise.resolve(false);
      return Promise.resolve(true);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  countEditedQuotations = async (quotationId: string): Promise<number> => {
    try {
      const count = await this.prisma.edited_quotation.count({
        where: {
          quotation_id: quotationId,
        },
      });

      return Promise.resolve(count);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  private processQuotationFilterParams = (
    params: QuotationFilters
  ): Prisma.QuotationWhereInput => {
    const searchObj: Prisma.QuotationWhereInput = {};
    if (params.id) {
      searchObj["quotation_id"] = {
        contains: params.id,
        // mode: "insensitive",
      };
    }
    if (params.user) {
      searchObj["user"] = {
        firstName: {
          contains: params.user,
        },
      };
    }
    if (params.client) {
      searchObj["OR"] = [
        {
          client_data: {
            name: {
              contains: params.client,
            },
          },
        },
        {
          client_data: {
            contact_person: {
              contains: params.client,
            },
          },
        },
      ];
    }
    if (params.status) {
      searchObj["quotationStatus"] = {
        status: {
          contains: params.status,
        },
      };
    }
    if (params.category) {
      searchObj["quotationCategory"] = {
        cat: {
          contains: params.category,
        },
      };
    }
    if (params.dataAltered) {
      const startTime = new Date(params.start).getTime();
      const endTime = new Date(params.end).getTime();
      searchObj["time"] = {
        gte: BigInt(startTime),
        lte: BigInt(endTime),
      };
    }

    return searchObj;
  };

  private checkQuotationFilterParams = (
    filterParams: QuotationFilters
  ): boolean => {
    const { start, end, ...rest } = filterParams;
    let someValueExists = false;
    const keys = Object.keys(rest);

    for (const _key of keys) {
      const key = _key as keyof Omit<QuotationFilters, "start" | "end">;
      const value = rest[key];

      if (key === "dataAltered" && value) {
        someValueExists = true;
        break;
      }

      if (typeof value !== "boolean" && value && value.length > 2) {
        someValueExists = true;
        break;
      }
    }

    return someValueExists;
  };

  private isQuotationExpired = (
    time: number,
    validityDays: number
  ): boolean => {
    const createdAt = time;
    const expiryTime = createdAt + daysToMilliseconds(validityDays);
    return isDateExpired(expiryTime);
  };

  fetchUnFlaggedExpiredQuotations = async (): Promise<{
    quotations: Quotation[];
    editedQuotations: Edited_quotation[];
  }> => {
    try {
      const rawQuotations = await this.prisma.quotation.findMany({
        where: {
          status_id: { notIn: [3, 4, 5] },
        },
      });

      const rawEditedQuotations = await this.prisma.edited_quotation.findMany({
        where: {
          status_id: { notIn: [3, 4, 5] },
        },
      });

      const expiredQuotations: Quotation[] = [];
      const expiredEditedQuotations: Edited_quotation[] = [];

      for (const quot of rawQuotations) {
        const isExpired = this.isQuotationExpired(
          Number(quot.time),
          quot.validity_days
        );

        if (isExpired) {
          expiredQuotations.push(quot);
        }
      }

      for (const editedQuot of rawEditedQuotations) {
        const isExpired = this.isQuotationExpired(
          Number(editedQuot.time),
          editedQuot.validity_days
        );

        if (isExpired) {
          expiredEditedQuotations.push(editedQuot);
        }
      }

      return Promise.resolve({
        quotations: expiredQuotations,
        editedQuotations: expiredEditedQuotations,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateUnFlaggedExpiredQuotations = async (quotationGroups: {
    quotations: Quotation[];
    editedQuotations: Edited_quotation[];
  }): Promise<{
    quotationsCount: number;
    editedQuotationsCount: number;
  }> => {
    try {
      const rawQuotations = await this.prisma.quotation.updateMany({
        data: {
          status_id: 5,
        },
        where: {
          quotation_id: {
            in: quotationGroups.quotations.map((item) => item.quotation_id),
          },
        },
      });

      const rawEditedQuotations = await this.prisma.edited_quotation.updateMany(
        {
          data: {
            status_id: 5,
          },
          where: {
            quotation_id: {
              in: quotationGroups.editedQuotations.map(
                (item) => item.quotation_id
              ),
            },
          },
        }
      );

      return Promise.resolve({
        quotationsCount: rawQuotations.count,
        editedQuotationsCount: rawEditedQuotations.count,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchFollowupQuotations = async (): Promise<{
    createdQuotations: QuotationsForRemainder;
    sentQuotations: QuotationsForRemainder;
  }> => {
    try {
      const timeNow = new Date().getTime();
      const stepperTime = hoursToMilliseconds(6);

      const rawQuotations = await this.prisma.quotation.findMany({
        where: {
          status_id: { in: [1, 2] },
        },
        include: {
          user: true,
          client_data: true,
        },
      });

      const rawEditedQuotations = await this.prisma.edited_quotation.findMany({
        where: {
          status_id: { in: [1, 2] },
        },
        include: {
          user: true,
          client_data: true,
        },
      });

      const createdQuotations: QuotationsForRemainder = {
        firstTime: [],
        lastTime: [],
      };

      const sentQuotations: QuotationsForRemainder = {
        firstTime: [],
        lastTime: [],
      };

      for (const quot of [...rawQuotations, ...rawEditedQuotations]) {
        const createdAt = Number(quot.time);
        const expiryTime = createdAt + daysToMilliseconds(quot.validity_days);
        const halfRemTime = expiryTime - expiryTime * 0.5;
        const fifthRemTime = expiryTime - expiryTime * 0.2;

        const isHalfTimeRange =
          halfRemTime >= timeNow && halfRemTime <= timeNow + stepperTime;
        const isLastFifthTimeRange =
          fifthRemTime >= timeNow && fifthRemTime <= timeNow + stepperTime;

        if (isHalfTimeRange) {
          if (quot.status_id === 1) {
            createdQuotations.firstTime.push(quot);
          } else if (quot.status_id === 2) {
            sentQuotations.firstTime.push(quot);
          }
        } else if (isLastFifthTimeRange) {
          if (quot.status_id === 1) {
            createdQuotations.lastTime.push(quot);
          } else if (quot.status_id === 2) {
            sentQuotations.lastTime.push(quot);
          }
        }
      }

      return Promise.resolve({
        createdQuotations: createdQuotations,
        sentQuotations: sentQuotations,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  tagUserOnQuotation = async (
    user: QuotationTaggedUser,
    quotationId: QuotationId,
    isVariant: boolean
  ): Promise<QuotationTaggedUser[] | null> => {
    try {
      const existingTaggedUsersData =
        await this.prisma.quotation_tagged_users.findFirst({
          where: isVariant
            ? { edited_quotation_id: quotationId.quotationId }
            : { main_quotation_id: quotationId.quotationNumber },
        });

      if (!existingTaggedUsersData) {
        const newTaggedUsersData =
          await this.prisma.quotation_tagged_users.create({
            data: isVariant
              ? {
                  edited_quotation_id: quotationId.quotationId,
                  taggedUsers: JSON.stringify([user]),
                }
              : {
                  main_quotation_id: quotationId.quotationNumber,
                  taggedUsers: JSON.stringify([user]),
                },
          });

        if (!newTaggedUsersData) return Promise.resolve(null);

        return Promise.resolve(
          this.formatQuotationTaggedUsers(newTaggedUsersData)
        );
      }

      const existingTaggedUsers: QuotationTaggedUser[] | null =
        this.formatQuotationTaggedUsers(existingTaggedUsersData);

      let updatedTaggedUsersArr: QuotationTaggedUser[] = [];

      if (!existingTaggedUsers) {
        updatedTaggedUsersArr = [user];
      } else {
        const isExisting = existingTaggedUsers.some(
          (item) => item.co_user_id === user.co_user_id
        );

        if (isExisting) {
          return Promise.resolve(existingTaggedUsers);
        }

        updatedTaggedUsersArr = [...existingTaggedUsers, user];
      }

      const updatedTaggedUsersData =
        await this.prisma.quotation_tagged_users.update({
          where: { id: existingTaggedUsersData.id },
          data: {
            taggedUsers: JSON.stringify(updatedTaggedUsersArr),
          },
        });

      if (!updatedTaggedUsersData) return Promise.resolve(null);

      return Promise.resolve(
        this.formatQuotationTaggedUsers(updatedTaggedUsersData)
      );
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  countUserQuotationDrafts = async (userId: number): Promise<number> => {
    try {
      const createdDraft = await this.prisma.quotation_draft.count({
        where: {
          userId: userId,
        },
      });

      return Promise.resolve(createdDraft);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  recordQuotationDraft = async (
    quotationDraft: NewQuotation,
    userId: number
  ): Promise<boolean> => {
    try {
      const { quotationId } = quotationDraft;

      const createdDraft = await this.prisma.quotation_draft.upsert({
        where: { id: BigInt(quotationId), userId: userId },
        create: {
          id: BigInt(quotationId),
          userId: userId,
          draft: JSON.stringify(quotationDraft),
        },
        update: {
          draft: JSON.stringify(quotationDraft),
        },
      });

      if (createdDraft) return Promise.resolve(true);

      return Promise.resolve(false);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchUserQuotationDrafts = async (
    userId: number
  ): Promise<NewQuotation[]> => {
    try {
      const dbQuotationDrafts = await this.prisma.quotation_draft.findMany({
        where: { userId: userId },
      });

      const quotationDrafts: NewQuotation[] = [];

      for (const dbDraft of dbQuotationDrafts) {
        try {
          const draft: NewQuotation = JSON.parse(dbDraft.draft);
          quotationDrafts.push(draft);
        } catch (err) {
          logger.error("Error parsing quotation draft " + dbDraft.id, err);
          continue;
        }
      }

      return Promise.resolve(quotationDrafts);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteQuotationDraft = async (
    userId: number,
    draftId: number
  ): Promise<boolean> => {
    try {
      const deletedDraft = await this.prisma.quotation_draft.delete({
        where: {
          id: BigInt(draftId),
          userId: userId,
        },
      });

      if (deletedDraft) return Promise.resolve(true);

      return Promise.resolve(false);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteAllQuotationDrafts = async (userId: number): Promise<boolean> => {
    try {
      const deletedDraftsRes = await this.prisma.quotation_draft.deleteMany({
        where: {
          userId: userId,
        },
      });

      return Promise.resolve(true);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  private formatQuotationTaggedUsers = (
    taggedUsers: Quotation_tagged_users | Quotation_tagged_users[]
  ): QuotationTaggedUser[] | null => {
    try {
      let jsonStr = "";

      if (Array.isArray(taggedUsers)) {
        if (taggedUsers.length < 1) return null;
        jsonStr = taggedUsers[0].taggedUsers;
      } else {
        jsonStr = taggedUsers.taggedUsers;
      }

      if (!jsonStr) return null;

      const formattedTaggedUsers: QuotationTaggedUser[] = JSON.parse(
        jsonStr
      ) as QuotationTaggedUser[];

      return formattedTaggedUsers;
    } catch (err) {
      logger.error("Quotation Tagged Users Error", err);
      return null;
    }
  };
}
