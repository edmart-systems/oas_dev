import { logger } from "@/logger/default-logger";
import { NewQuotationDtoSchema } from "@/schema-dtos/quotations.dto";
import { QuotationsService } from "@/services/quotations-service/quotations.service";
import { ActionResponse } from "@/types/actions-response.types";
import { NewQuotation } from "@/types/quotations.types";
import { SessionService } from "@/services/auth-service/session.service";
import { safeBodyParse } from "@/utils/api-utils/api.utils";
import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";
import { getAuthSession } from "@/server-actions/auth-actions/auth.actions";
import {
  BAD_REQUEST_RESPONSE,
  NOT_AUTHORIZED_RESPONSE,
} from "@/utils/constants.utils";

const quotationsService = new QuotationsService();
const sessionService = new SessionService();

const FetchOrDeleteQuotationsSchema = zod.object({
  userId: zod.number(),
});

const CreateQuotationDraftSchema = zod.object({
  userId: zod.number(),
  quotationDraft: NewQuotationDtoSchema,
});

//Fetch all quotation
export const PUT = async (req: NextRequest) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    let body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const parsed = FetchOrDeleteQuotationsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const { userId } = parsed.data;

    const res: ActionResponse<NewQuotation[]> =
      await quotationsService.fetchQuotationDrafts(userId);

    return new NextResponse(JSON.stringify(res), { status: 200 });
  } catch (err) {
    logger.error(err);
    const res: ActionResponse = {
      status: false,
      message: "Something went wrong",
    };
    return new NextResponse(JSON.stringify(res), { status: 500 });
  }
};

//Add a new quotation draft
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    let body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const parsed = await CreateQuotationDraftSchema.safeParseAsync(body);

    if (!parsed.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const { userId, quotationDraft } = parsed.data;

    const res: ActionResponse = await quotationsService.addQuotationDraft(
      quotationDraft,
      userId
    );

    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    logger.error(err);
    const res: ActionResponse = {
      status: false,
      message: "Something went wrong",
    };
    return new NextResponse(JSON.stringify(res), { status: 500 });
  }
};

//Delete all user drafts
export const DELETE = async (req: NextRequest) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    let body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const parsed = FetchOrDeleteQuotationsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const { userId } = parsed.data;

    const res: ActionResponse =
      await quotationsService.deleteAllUserQuotationDrafts(userId);

    return new NextResponse(JSON.stringify(res), { status: 200 });
  } catch (err) {
    logger.error(err);
    const res: ActionResponse = {
      status: false,
      message: "Something went wrong",
    };
    return new NextResponse(JSON.stringify(res), { status: 500 });
  }
};
