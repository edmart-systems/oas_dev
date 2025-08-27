import {
  CreateQuotationPageData,
  NewQuotation,
  PaginatedQuotationsParameter,
  QuotationStatusCounts,
  RawClientQuotationData,
  RawQuotationData,
  TcsDto,
  Unit2,
  PaginatedQuotations,
  FullQuotation,
  SingleQuotationPageData,
  QuotationStatusKey,
  EditQuotationPageData,
  NewEditQuotationData,
  RawEditQuotationData,
  SingleEditedQuotationPageData,
  QuotationId,
  SummarizedQuotation,
  EditedSummarizedQuotation,
  QuotationWithUserAndClient,
  EditedQuotationWithUserAndClient,
  QuotationTaggedUser,
} from "@/types/quotations.types";
import prisma from "../../../db/db";
import { QuotationsRepository } from "./quotations.repository";
import { ActionResponse } from "@/types/actions-response.types";
import { logger } from "@/logger/default-logger";
import {
  Edited_quotation,
  Quotation,
  Quotation_category,
  Quotation_status,
  Quotation_type,
} from "@prisma/client";
import { CompanyService } from "../company-service/company.service";
import { CompanyDto } from "@/types/company.types";
import { Currency2 } from "@/types/currency.types";
import {
  processQuotationLineItems,
  verifyClientInfo,
  verifyLineItems,
  verifyTcs,
} from "./create-quotation";
import { SessionUser } from "../../server-actions/auth-actions/auth.actions";
import {
  validateCompanyId,
  validateQuotationId,
  validateQuotationIdObject,
} from "@/utils/verification-validation.utils";
import { UserSignatureService } from "../user-service/user-signature-service/user-signature.service";
import { UserSignatureDto } from "@/types/user.types";
import { daysToMilliseconds } from "@/utils/time-converters.utils";
import { fDateDdMmmYyyy, isDateExpired } from "@/utils/time.utils";
import {
  MAXIMUM_QUOTATION_DRAFTS,
  MAXIMUM_QUOTATION_EDITS,
  NOT_AUTHORIZED_RESPONSE,
} from "@/utils/constants.utils";
import {
  NewNotification,
  QuotationFollowUpNotificationData,
} from "@/types/notification.types";
import { NotificationService } from "../notification-service/notification.service";
import { UserService } from "../user-service/user.service";
import { userNameFormatterSummary } from "@/utils/formatters.util";
import { sendQuotationTagEmail } from "@/comm/emails/quotation.emails";

export class QuotationsService {
  private readonly quotationsRepo = new QuotationsRepository(prisma);
  private readonly companyService = new CompanyService();
  private readonly signatureService = new UserSignatureService();

  constructor() { }

  getCreateQuotationPageData = async (
    userId: string
  ): Promise<ActionResponse<CreateQuotationPageData>> => {
    try {
      const quotationTypes: Quotation_type[] =
        await this.quotationsRepo.fetchQuotationTypes();

      const quotationCategories: Quotation_category[] =
        await this.quotationsRepo.fetchQuotationCategories();

      const company: CompanyDto = await this.companyService.getCompanyDetails();

      const tcs: TcsDto[] = await this.quotationsRepo.fetchQuotationTcs();

      const units: Unit2[] = await this.quotationsRepo.fetchUnits2();

      const currencies: Currency2[] =
        await this.quotationsRepo.fetchCurrencies2();

      const userSignature: ActionResponse<UserSignatureDto> =
        await this.signatureService.getUserSignature(userId);

      const pageData: CreateQuotationPageData = {
        quotationTypes: quotationTypes,
        quotationCategories: quotationCategories,
        company: company,
        tcs: tcs,
        units: units,
        currencies: currencies,
        userSignature: userSignature.data ? userSignature.data : null,
      };

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: pageData,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getEditQuotationPageData = async (
    userId: string,
    quotationId: string
  ): Promise<ActionResponse<EditQuotationPageData>> => {
    try {
      if (!validateQuotationId(quotationId) || !validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Bad request",
        });
      }

      const newQuotationRes = await this.getCreateQuotationPageData(userId);

      if (!newQuotationRes.status || !newQuotationRes.data) {
        return Promise.resolve({
          status: false,
          message: "New quotation data failure",
        });
      }

      const newQuotationData: CreateQuotationPageData = newQuotationRes.data;

      const quotation: Omit<FullQuotation, "signature"> | null =
        await this.quotationsRepo.fetchSingleFullQuotation(quotationId);

      if (!quotation) {
        return Promise.resolve({
          status: false,
          message: "Not Found",
        });
      }

      const res: EditQuotationPageData = {
        ...newQuotationData,
        quotation: quotation,
      };

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: res,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  createNewQuotation = async (
    user: SessionUser,
    newQuotation: NewQuotation
  ): Promise<ActionResponse> => {
    try {
      const {
        clientData,
        lineItems,
        tcs,
        currency,
        tcsEdited,
        vatExcluded,
        time,
        type,
        category,
      } = newQuotation;

      const tcsCheck = verifyTcs({
        selectedTcs: tcs,
        quotationType: type,
        editTcs: tcsEdited,
      });

      const clientCheck = verifyClientInfo(clientData);
      const itemsCheck = verifyLineItems(lineItems);

      if (!tcsCheck.valid || !clientCheck.valid || !itemsCheck.valid) {
        const errsArr: string[] = [];
        tcsCheck.errors && errsArr.push(...tcsCheck.errors);
        clientCheck.errors && errsArr.push(...clientCheck.errors);
        itemsCheck.errors && errsArr.push(...itemsCheck.errors);

        const res: ActionResponse = {
          status: false,
          message: "Bad Request",
          data: errsArr.join(" & "),
        };
        return Promise.resolve(res);
      }

      const _clientData: RawClientQuotationData = {
        name: clientData.name ? clientData.name.trim() : "",
        contact_person: clientData.contactPerson
          ? clientData.contactPerson.trim()
          : "",
        external_ref: clientData.ref ? clientData.ref.trim() : "",
        email: clientData.email ? clientData.email.trim() : "",
        phone: clientData.phone ? clientData.phone.trim() : "",
        country: clientData.country ? clientData.country.trim() : "",
        address_Line_1: clientData.addressLine1
          ? clientData.addressLine1.trim()
          : "",
        city: clientData.city ? clientData.city.trim() : "",
        box_number: clientData.boxNumber,
      };

      const lineItemsResult = processQuotationLineItems(
        lineItems,
        vatExcluded,
        tcs
      );

      const quotationId = await this.generateQuotationId();

      const _quotationData: RawQuotationData = {
        co_user_id: user.co_user_id,
        time: BigInt(time),
        quotation_type_id: type.type_id,
        tcs_edited: tcsEdited ? 1 : 0,
        vat_excluded: vatExcluded ? 1 : 0,
        tcs_id: tcs.tc_id,
        cat_id: category.cat_id,
        currency_id: currency.currency_id,
        quotation_id: quotationId,

        validity_days: tcsEdited
          ? (tcs.edited_validity_days ?? tcs.validity_days)
          : tcs.validity_days,

        payment_grace_days: tcsEdited
          ? (tcs.edited_payment_grace_days ?? tcs.payment_grace_days)
          : tcs.payment_grace_days,

        initial_payment_percentage: tcsEdited
          ? (tcs.edited_initial_payment_percentage ?? tcs.initial_payment_percentage)
          : tcs.initial_payment_percentage,

        last_payment_percentage: tcsEdited
          ? (tcs.edited_last_payment_percentage ?? tcs.last_payment_percentage)
          : tcs.last_payment_percentage,

        sub_total: lineItemsResult.sub_total,
        vat: lineItemsResult.vat,
        grand_total: lineItemsResult.grand_total,
      };

      const createdQuotation = await this.quotationsRepo.recordNewQuotation({
        clientData: _clientData,
        lineItems: lineItemsResult.lineItems,
        quotationData: _quotationData,
      });

      const res: ActionResponse = {
        status: true,
        message: "Success",
        data: createdQuotation.quotation_id,
      };
      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      console.error("Unexpected error in createNewQuotation:", err);
      return Promise.reject(err);
    }
  };


  createEditedQuotation = async (
    user: SessionUser,
    editQuotation: NewEditQuotationData
  ): Promise<ActionResponse<QuotationId>> => {
    try {
      const {
        clientData,
        lineItems,
        tcs,
        currency,
        tcsEdited,
        vatExcluded,
        time,
        type,
        category,
        createTime,
        quotationId,
      } = editQuotation;

      const tcsCheck = verifyTcs({
        selectedTcs: tcs,
        quotationType: type,
        editTcs: tcsEdited,
      });

      const originalQuotation: Quotation | null =
        await this.quotationsRepo.fetchSingleBaseQuotation(quotationId);

      if (!originalQuotation) {
        return Promise.resolve({
          status: false,
          message: "Original quotation not found",
        });
      }

      const existingEdits: number =
        await this.quotationsRepo.countEditedQuotations(quotationId);

      if (existingEdits >= MAXIMUM_QUOTATION_EDITS) {
        return Promise.resolve({
          status: false,
          message: "Maximum edits reached, consider creating a new quotation",
        });
      }

      const clientCheck = verifyClientInfo(clientData);

      const itemsCheck = verifyLineItems(lineItems);

      if (!tcsCheck.valid || !clientCheck.valid || !itemsCheck.valid) {
        const errsArr: string[] = [];
        tcsCheck.errors && errsArr.push(...tcsCheck.errors);
        clientCheck.errors && errsArr.push(...clientCheck.errors);
        itemsCheck.errors && errsArr.push(...itemsCheck.errors);

        const res: ActionResponse = {
          status: false,
          message: "Bad Request",
          data: errsArr.join(" & "),
        };
        return Promise.resolve(res);
      }

      const _clientData: RawClientQuotationData = {
        name: clientData.name ? clientData.name.trim() : "",
        contact_person: clientData.contactPerson
          ? clientData.contactPerson.trim()
          : "",
        external_ref: clientData.ref ? clientData.ref.trim() : "",
        email: clientData.email ? clientData.email.trim() : "",
        phone: clientData.phone ? clientData.phone.trim() : "",
        country: clientData.country ? clientData.country.trim() : "",
        address_Line_1: clientData.addressLine1
          ? clientData.addressLine1.trim()
          : "",
        city: clientData.city ? clientData.city.trim() : "",
        box_number: clientData.boxNumber,
      };

      const lineItemsResult = processQuotationLineItems(
        lineItems,
        vatExcluded,
        tcs
      );

      const _quotationData: RawEditQuotationData = {
        co_user_id: user.co_user_id,
        time: BigInt(time),
        created_time: BigInt(createTime),
        quotation_type_id: type.type_id,
        tcs_edited: tcsEdited ? 1 : 0,
        vat_excluded: vatExcluded ? 1 : 0,
        tcs_id: tcs.tc_id,
        cat_id: category.cat_id,
        currency_id: currency.currency_id,
        quotation_id: quotationId,
        // validity_days:
        //   tcsEdited && tcs.edited_validity_days
        //     ? tcs.edited_validity_days
        //     : tcs.validity_days,
        // payment_grace_days:
        //   tcsEdited && tcs.edited_payment_grace_days
        //     ? tcs.edited_payment_grace_days
        //     : tcs.payment_grace_days,
        // initial_payment_percentage:
        //   tcsEdited && tcs.edited_initial_payment_percentage
        //     ? tcs.edited_initial_payment_percentage
        //     : tcs.initial_payment_percentage,
        // last_payment_percentage:
        //   tcsEdited && tcs.edited_last_payment_percentage
        //     ? tcs.edited_last_payment_percentage
        //     : tcs.last_payment_percentage,
        validity_days: tcsEdited
          ? (tcs.edited_validity_days ?? tcs.validity_days)
          : tcs.validity_days,

        payment_grace_days: tcsEdited
          ? (tcs.edited_payment_grace_days ?? tcs.payment_grace_days)
          : tcs.payment_grace_days,

        initial_payment_percentage: tcsEdited
          ? (tcs.edited_initial_payment_percentage ?? tcs.initial_payment_percentage)
          : tcs.initial_payment_percentage,

        last_payment_percentage: tcsEdited
          ? (tcs.edited_last_payment_percentage ?? tcs.last_payment_percentage)
          : tcs.last_payment_percentage,
          
        sub_total: lineItemsResult.sub_total,
        vat: lineItemsResult.vat,
        grand_total: lineItemsResult.grand_total,
      };

      const editedQuotation: Edited_quotation =
        await this.quotationsRepo.recordNewEditQuotation({
          clientData: _clientData,
          lineItems: lineItemsResult.lineItems,
          quotationData: _quotationData,
        });

      return Promise.resolve({
        status: true,
        message: "Success",
        data: {
          quotationNumber: editedQuotation.quotation_id,
          quotationId: editedQuotation.id,
        },
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getSingleQuotationPageData = async (
    quotationId: string
  ): Promise<ActionResponse> => {
    try {
      if (!validateQuotationId(quotationId)) {
        return Promise.resolve({
          status: false,
          message: "Bad request",
        });
      }

      const company: CompanyDto = await this.companyService.getCompanyDetails();

      const quotation: Omit<FullQuotation, "signature"> | null =
        await this.quotationsRepo.fetchSingleFullQuotation(quotationId);

      if (!quotation) {
        return Promise.resolve({
          status: false,
          message: "Not Found",
        });
      }

      const userSignature: ActionResponse<UserSignatureDto> =
        await this.signatureService.getUserSignature(quotation.user.co_user_id);

      if (!userSignature.data) {
        return Promise.resolve({
          status: false,
          message: "Signature Not Found",
        });
      }

      const quotationVariants =
        await this.quotationsRepo.fetchSummarizedEditedQuotationsById(
          quotation.quotationId
        );

      const pageData: SingleQuotationPageData = {
        quotation: {
          ...quotation,
          signature: userSignature.data,
          variants: quotationVariants,
        },
        company: company,
      };

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: pageData,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getSingleEditedQuotationPageData = async (
    _quotationId: QuotationId
  ): Promise<ActionResponse<SingleEditedQuotationPageData>> => {
    try {
      if (!validateQuotationId(_quotationId.quotationNumber)) {
        return Promise.resolve({
          status: false,
          message: "Bad request",
        });
      }

      const company: CompanyDto = await this.companyService.getCompanyDetails();

      const quotation: Omit<FullQuotation, "signature"> | null =
        await this.quotationsRepo.fetchEditedSingleFullQuotation(_quotationId);

      if (!quotation) {
        return Promise.resolve({
          status: false,
          message: "Not Found",
        });
      }

      const userSignature: ActionResponse<UserSignatureDto> =
        await this.signatureService.getUserSignature(quotation.user.co_user_id);

      if (!userSignature.data) {
        return Promise.resolve({
          status: false,
          message: "Signature Not Found",
        });
      }

      const pageData: SingleEditedQuotationPageData = {
        quotation: {
          ...quotation,
          signature: userSignature.data,
        },
        company: company,
      };

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: pageData,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getQuotationsSumSummary = async (userData: {
    isAdmin: boolean;
    userId: string;
  }): Promise<ActionResponse<QuotationStatusCounts>> => {
    try {
      const sums: QuotationStatusCounts =
        await this.quotationsRepo.fetchQuotationStatusCount(userData);

      return Promise.resolve({
        status: true,
        message: "success",
        data: sums,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getPaginatedQuotations = async (
    args: PaginatedQuotationsParameter
  ): Promise<ActionResponse> => {
    try {
      const paginatedQuotations: PaginatedQuotations =
        await this.quotationsRepo.fetchPaginatedQuotations(args);

      return Promise.resolve({
        status: true,
        message: "success",
        data: paginatedQuotations,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateQuotationStatus = async (
    userId: string,
    quotationId: string,
    status: QuotationStatusKey
  ): Promise<ActionResponse> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Bad request",
        });
      }

      if (!validateQuotationId(quotationId)) {
        return Promise.resolve({
          status: false,
          message: "Bad request",
        });
      }

      const quotation: Quotation | null =
        await this.quotationsRepo.fetchSingleBaseQuotation(quotationId);

      if (!quotation) {
        return Promise.resolve({
          status: false,
          message: "Quotation Not found",
        });
      }

      const quotationStatus: Quotation_status | null =
        await this.quotationsRepo.fetchQuotationStatusByName(status);

      if (!quotationStatus) {
        return Promise.resolve({
          status: false,
          message: "Status not available",
        });
      }

      if (userId !== quotation.co_user_id) {
        return Promise.resolve({
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        });
      }

      if (quotationStatus.status_id === quotation.status_id) {
        return Promise.resolve({
          status: false,
          message: "Nothing to update",
        });
      }

      const createdAt = Number(quotation.time);
      const expiryTime =
        createdAt + daysToMilliseconds(quotation.validity_days);
      const isExpired = isDateExpired(expiryTime);

      if (isExpired || quotation.status_id === 5) {
        return Promise.resolve({
          status: false,
          message: "Quotation is expired",
        });
      }

      if (status === "expired" || status === "created") {
        return Promise.resolve({
          status: false,
          message: "Quotation status can not be set to " + status,
        });
      }

      const isUpdated = await this.quotationsRepo.updateQuotationStatusId(
        quotationId,
        quotationStatus.status_id
      );

      if (!isUpdated) {
        return Promise.resolve({
          status: false,
          message: "Failed to update status",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Successful",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateEditedQuotationStatus = async (
    userId: string,
    _quotationId: QuotationId,
    status: QuotationStatusKey
  ): Promise<ActionResponse> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Bad request",
        });
      }

      if (!validateQuotationId(_quotationId.quotationNumber)) {
        return Promise.resolve({
          status: false,
          message: "Bad request",
        });
      }

      const quotation: Edited_quotation | null =
        await this.quotationsRepo.fetchEditedSingleBaseQuotation(_quotationId);

      if (!quotation) {
        return Promise.resolve({
          status: false,
          message: "Quotation Not found",
        });
      }

      const quotationStatus: Quotation_status | null =
        await this.quotationsRepo.fetchQuotationStatusByName(status);

      if (!quotationStatus) {
        return Promise.resolve({
          status: false,
          message: "Status not available",
        });
      }

      if (userId !== quotation.co_user_id) {
        return Promise.resolve({
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        });
      }

      if (quotationStatus.status_id === quotation.status_id) {
        return Promise.resolve({
          status: false,
          message: "Nothing to update",
        });
      }

      const createdAt = Number(quotation.time);
      const expiryTime =
        createdAt + daysToMilliseconds(quotation.validity_days);
      const isExpired = isDateExpired(expiryTime);

      if (isExpired || quotation.status_id === 5) {
        return Promise.resolve({
          status: false,
          message: "Quotation is expired",
        });
      }

      if (status === "expired" || status === "created") {
        return Promise.resolve({
          status: false,
          message: "Quotation status can not be set to " + status,
        });
      }

      const isUpdated = await this.quotationsRepo.updateEditedQuotationStatusId(
        _quotationId,
        quotationStatus.status_id
      );

      if (!isUpdated) {
        return Promise.resolve({
          status: false,
          message: "Failed to update status",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Successful",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getSingleQuotation = async (
    id: QuotationId,
    isVariant: boolean
  ): Promise<SummarizedQuotation | EditedSummarizedQuotation | null> => {
    try {
      if (!validateQuotationId(id.quotationNumber) || isNaN(id.quotationId)) {
        return Promise.resolve(null);
      }

      let quotation: SummarizedQuotation | EditedSummarizedQuotation | null;

      if (isVariant) {
        quotation =
          await this.quotationsRepo.fetchSingleSummarizedEditedQuotation(id);
      } else {
        quotation = await this.quotationsRepo.fetchSingleSummarizedQuotation(
          id
        );
      }

      return Promise.resolve(quotation);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateUnFlaggedExpiredQuotationsHandler =
    async (): Promise<ActionResponse> => {
      try {
        const quotationGroups =
          await this.quotationsRepo.fetchUnFlaggedExpiredQuotations();

        const updateRes =
          await this.quotationsRepo.updateUnFlaggedExpiredQuotations(
            quotationGroups
          );

        const totalQuotations =
          quotationGroups.editedQuotations.length +
          quotationGroups.quotations.length;
        const updatedCount =
          updateRes.quotationsCount + updateRes.editedQuotationsCount;
        const failedCount = totalQuotations - updatedCount;

        const message = `Total Un-flagged Expired Quotations: ${totalQuotations}, Updated: ${updatedCount}, Failed: ${failedCount >= 0 ? failedCount : 0
          }`;

        return Promise.resolve({
          status: true,
          message: message,
        });
      } catch (err) {
        logger.error(err);
        return Promise.reject(err);
      }
    };

  sendQuotationFollowupNotifications = async (): Promise<ActionResponse> => {
    try {
      const quotationGroups =
        await this.quotationsRepo.fetchFollowupQuotations();

      const { createdQuotations, sentQuotations } = quotationGroups;

      const compileNotification = (
        quot: QuotationWithUserAndClient | EditedQuotationWithUserAndClient,
        title: string,
        templateId: number
      ): NewNotification => {
        {
          const messageObj: QuotationFollowUpNotificationData = {
            id: quot.quotation_id,
            client: `${quot.client_data.name}${quot.client_data.contact_person
              ? ` (${quot.client_data.contact_person})`
              : ""
              }`,
            date: fDateDdMmmYyyy(Number(quot.time)),
          };

          const notification: NewNotification = {
            title: title,
            message: JSON.stringify(messageObj),
            time: BigInt(new Date().getTime()),
            userId: quot.user.userId,
            template_id: templateId,
            type_id: 2,
            action_data:
              "created_time" in quot
                ? `${quot.quotation_id}.${quot.id}`
                : quot.quotation_id,
          };

          return notification;
        }
      };

      const notifications: NewNotification[] = [];

      for (const quot of createdQuotations.firstTime) {
        notifications.push(compileNotification(quot, "Followup Reminder", 1));
      }

      for (const quot of createdQuotations.lastTime) {
        notifications.push(compileNotification(quot, "Urgent Reminder", 2));
      }

      for (const quot of sentQuotations.firstTime) {
        notifications.push(compileNotification(quot, "Followup Reminder", 3));
      }

      for (const quot of sentQuotations.lastTime) {
        notifications.push(compileNotification(quot, "Urgent Reminder", 4));
      }

      const res = await NotificationService.recordNewNotificationsBatch(
        notifications
      );

      const message = `Create Quotations: First time => ${createdQuotations.firstTime.length}, Last time: ${createdQuotations.lastTime.length} || Sent Quotations: First time => ${sentQuotations.firstTime.length}, Last time: ${sentQuotations.lastTime.length} ||| ${res.message}`;

      return Promise.resolve({
        status: true,
        message: message,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  addTaggedUserOnQuotation = async (
    tagUsers: QuotationTaggedUser[],
    quotationId: QuotationId,
    isVariant: boolean,
    message: string | null,
    thisUser: SessionUser
  ): Promise<ActionResponse<QuotationTaggedUser[]>> => {
    try {
      if (!validateQuotationIdObject(quotationId)) {
        return Promise.resolve({
          status: false,
          message: "Bad request",
        });
      }

      const quotation = isVariant
        ? await this.quotationsRepo.fetchEditedSingleBaseQuotation(quotationId)
        : await this.quotationsRepo.fetchSingleBaseQuotation(
          quotationId.quotationNumber
        );

      if (!quotation) {
        return Promise.resolve({
          status: false,
          message: "Quotation not found",
        });
      }

      if (thisUser.co_user_id !== quotation.co_user_id) {
        return Promise.resolve({
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        });
      }

      const failed: QuotationTaggedUser[] = [];
      const successful: QuotationTaggedUser[] = [];
      let finalUpdatedTaggedUsers: QuotationTaggedUser[] = [];

      for (let i = 0; i < tagUsers.length; i++) {
        const tagUser = tagUsers[i];

        if (!validateCompanyId(tagUser.co_user_id)) {
          // "User not found"
          failed.push(tagUser);
          continue;
        }

        const taggedUser = await UserService.getUserByCompanyId(
          tagUser.co_user_id
        );

        if (!taggedUser) {
          // "User not found"
          failed.push(tagUser);
          continue;
        }

        const updatedTaggedUsers = await this.quotationsRepo.tagUserOnQuotation(
          tagUser,
          quotationId,
          isVariant
        );

        if (!updatedTaggedUsers) {
          failed.push(tagUser);
          continue;
        }

        NotificationService.recordNewNotification(
          this.sendQuotationTagNotification(
            quotationId,
            isVariant,
            thisUser,
            taggedUser.userId,
            message
          )
        );

        sendQuotationTagEmail({
          quotationId: quotationId,
          message: message,
          quotationIsVariant: isVariant,
          taggedUser: taggedUser,
          taggingUser: thisUser,
        });

        successful.push(tagUser);

        if (i === tagUsers.length - 1) {
          finalUpdatedTaggedUsers = updatedTaggedUsers;
        }
      }

      if (successful.length > 0) {
        const res: ActionResponse<QuotationTaggedUser[]> = {
          status: true,
          message: `${successful.length} Successful${failed.length > 0 ? `, ${failed.length} Failed` : ""
            }`,
          data: finalUpdatedTaggedUsers,
        };

        return Promise.resolve(res);
      }

      const res: ActionResponse<QuotationTaggedUser[]> = {
        status: false,
        message: "Failed to tag users",
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  addQuotationDraft = async (
    quotationDraft: NewQuotation,
    userId: number
  ): Promise<ActionResponse> => {
    try {
      const existingDraftsCount =
        await this.quotationsRepo.countUserQuotationDrafts(userId);
      if (existingDraftsCount >= MAXIMUM_QUOTATION_DRAFTS) {
        return Promise.resolve({
          status: false,
          message: "Maximum quotation drafts reached.",
        });
      }

      const isSaved = await this.quotationsRepo.recordQuotationDraft(
        quotationDraft,
        userId,
        'manual'
      );

      if (!isSaved) {
        return Promise.resolve({
          status: false,
          message: "Failed to save quotation draft.",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Quotation draft saved successfully",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  saveAutoDraft = async (
    quotationDraft: NewQuotation,
    userId: number
  ): Promise<ActionResponse> => {
    try {
      const isSaved = await this.quotationsRepo.recordAutoDraft(
        quotationDraft,
        userId
      );

      if (!isSaved) {
        return Promise.resolve({
          status: false,
          message: "Failed to save auto-draft.",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Auto-draft saved successfully",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getLatestAutoDraft = async (
    userId: number
  ): Promise<ActionResponse<{ draft: NewQuotation; timestamp: Date } | null>> => {
    try {
      const autoDraft = await this.quotationsRepo.fetchLatestAutoDraft(userId);
      
      return Promise.resolve({
        status: true,
        message: "Success",
        data: autoDraft,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteAutoDraft = async (userId: number): Promise<ActionResponse> => {
    try {
      const isDeleted = await this.quotationsRepo.deleteAutoDraft(userId);
      
      return Promise.resolve({
        status: true,
        message: "Auto-draft deleted successfully",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  fetchQuotationDrafts = async (
    userId: number
  ): Promise<ActionResponse<NewQuotation[]>> => {
    try {
      const quotationDrafts =
        await this.quotationsRepo.fetchUserQuotationDrafts(userId);

      const res: ActionResponse<NewQuotation[]> = {
        status: true,
        message: "Successful",
        data: quotationDrafts,
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteQuotationDraft = async (
    userId: number,
    quotationDraftId: number
  ): Promise<ActionResponse> => {
    try {
      const isDeleted = await this.quotationsRepo.deleteQuotationDraft(
        userId,
        quotationDraftId
      );

      if (!isDeleted)
        return Promise.resolve({
          status: false,
          message: "Failed to delete quotation draft",
        });

      return Promise.resolve({
        status: true,
        message: "Successful",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteAllUserQuotationDrafts = async (
    userId: number
  ): Promise<ActionResponse> => {
    try {
      const isDeleted = await this.quotationsRepo.deleteAllQuotationDrafts(
        userId
      );

      return Promise.resolve({
        status: true,
        message: "Successful",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  private sendQuotationTagNotification = (
    quotationId: QuotationId,
    quotationIsVariant: boolean,
    thisUser: SessionUser,
    taggedUserId: number,
    message: string | null
  ): NewNotification => {
    const notificationMessage = `You have been tagged by ${userNameFormatterSummary(
      thisUser.firstName,
      thisUser.lastName
    )} (${thisUser.co_user_id}) on quotation ${quotationId.quotationNumber}. ${message && message.length > 5
      ? `"${message}${message.substring(message.length - 1) === "." ? "" : "."
      }"`
      : ""
      } Please tap open to followup.`;

    return {
      title: "Quotation Tag",
      message: notificationMessage,
      time: BigInt(new Date().getTime()),
      userId: taggedUserId,
      template_id: null,
      type_id: 2,
      action_data: quotationIsVariant
        ? `${quotationId.quotationNumber}.${quotationId.quotationId}`
        : quotationId.quotationNumber,
    };
  };

  private generateQuotationId = async (): Promise<string> => {
    const maxMonthlyQuotations = 1000;
    const date = new Date();
    const ddStr = String(date.getDate()).padStart(2, "0");
    const mmStr = String(date.getMonth() + 1).padStart(2, "0");
    const yy = `${date.getFullYear()}`.substring(2);

    const firstPart = `Q${yy}${mmStr}${ddStr}`;

    const startOfMonthTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).getTime();

    let currentMonthQuotationCount = 1;

    try {
      currentMonthQuotationCount +=
        await this.quotationsRepo.countExistingMonthQuotations(
          startOfMonthTime
        );
    } catch (err) {
      logger.error(err);
      throw new Error("Unable to generate quotation ID");
    }

    const reverseNum = maxMonthlyQuotations - currentMonthQuotationCount;
    const lastPart = (
      reverseNum > 0
        ? String(reverseNum)
        : String(maxMonthlyQuotations + currentMonthQuotationCount)
    ).padStart(3, "0");

    return firstPart + lastPart;
  };
}
