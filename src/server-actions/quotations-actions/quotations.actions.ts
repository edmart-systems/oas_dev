//src/server-actions/quotations-actions/quotations.actions.ts
"use server";

import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import { getAuthSession } from "../auth-actions/auth.actions";
import { SessionService } from "../../services/auth-service/session.service";
import {
  CreateQuotationPageData,
  EditQuotationPageData,
  NewEditQuotationData,
  NewQuotation,
  PaginatedQuotationsParameter,
  QuotationFilters,
  QuotationId,
  QuotationStatusCounts,
  QuotationStatusKey,
  QuotationTaggedUser,
  SingleEditedQuotationPageData,
} from "@/types/quotations.types";
import { QuotationsService } from "../../services/quotations-service/quotations.service";
import { revalidatePath } from "next/cache";
import { paths } from "@/utils/paths.utils";
import { NOT_AUTHORIZED_RESPONSE } from "@/utils/constants.utils";

const sessionService = new SessionService();
const quotationsService = new QuotationsService();

export const getCreateNewQuotationsPageData =
  async (): Promise<ActionResponse> => {
    try {
      const session = await getAuthSession();

      if (!(await sessionService.checkIsUserSessionOk(session))) {
        return Promise.resolve({
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        });
      }

      const pageDataRes: ActionResponse =
        await quotationsService.getCreateQuotationPageData(
          session!.user.co_user_id
        );

      return Promise.resolve(pageDataRes);
    } catch (err) {
      logger.error(err);
      return Promise.resolve({
        status: false,
        message: "Something went wrong",
      });
    }
  };

export const getEditQuotationsPageData = async (
  quotationId: string
): Promise<ActionResponse<EditQuotationPageData>> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const pageDataRes: ActionResponse =
      await quotationsService.getEditQuotationPageData(
        session.user.co_user_id,
        quotationId
      );

    return Promise.resolve(pageDataRes);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const createNewQuotationAction = async (
  quotation: NewQuotation
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res = await quotationsService.createNewQuotation(
      session?.user!,
      quotation
    );

    revalidatePath(paths.dashboard.quotations.main);
    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const createEditedQuotation = async (
  quotation: NewEditQuotationData
): Promise<ActionResponse<QuotationId>> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res = await quotationsService.createEditedQuotation(
      session.user,
      quotation
    );

    revalidatePath(paths.dashboard.quotations.main);
    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const getQuotationsSums = async (): Promise<
  ActionResponse<QuotationStatusCounts>
> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res = await quotationsService.getQuotationsSumSummary({
      userId: session!.user.co_user_id,
      isAdmin: Boolean(session!.user.isAdmin),
    });

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const getPaginatedQuotation = async (
  details: Omit<PaginatedQuotationsParameter, "userId"> & {
    filterParams?: QuotationFilters;
  }
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res = await quotationsService.getPaginatedQuotations({
      ...details,
      userId: session!.user.co_user_id,
    });

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const fetchSingleQuotationPageData = async (
  quotationId: string
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res: ActionResponse =
      await quotationsService.getSingleQuotationPageData(quotationId);

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const fetchSingleEditedQuotationPageData = async (
  _quotationId: QuotationId
): Promise<ActionResponse<SingleEditedQuotationPageData>> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res = await quotationsService.getSingleEditedQuotationPageData(
      _quotationId
    );

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const updateQuotationStatus = async (
  quotationId: string,
  status: QuotationStatusKey
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res: ActionResponse = await quotationsService.updateQuotationStatus(
      session.user.co_user_id,
      quotationId,
      status
    );

    if (res.status) {
      revalidatePath(paths.dashboard.quotations.single(quotationId), "page");
      revalidatePath(paths.dashboard.quotations.main, "page");
    }

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const updateEditedQuotationStatus = async (
  _quotationId: QuotationId,
  status: QuotationStatusKey
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res: ActionResponse =
      await quotationsService.updateEditedQuotationStatus(
        session.user.co_user_id,
        _quotationId,
        status
      );

    if (res.status) {
      revalidatePath(paths.dashboard.quotations.edited(_quotationId), "page");
      revalidatePath(
        paths.dashboard.quotations.single(_quotationId.quotationNumber),
        "page"
      );
      revalidatePath(paths.dashboard.quotations.main, "page");
    }

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const tagUserOnQuotation = async (
  tagUsers: QuotationTaggedUser[],
  quotationId: QuotationId,
  isVariant: boolean,
  message: string | null
): Promise<ActionResponse<QuotationTaggedUser[]>> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res = await quotationsService.addTaggedUserOnQuotation(
      tagUsers,
      quotationId,
      isVariant,
      message,
      session.user
    );

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};
