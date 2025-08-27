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

const AutoDraftSchema = zod.object({
  userId: zod.number(),
  quotationDraft: NewQuotationDtoSchema,
});

const UserIdSchema = zod.object({
  userId: zod.number(),
});

// Save auto-draft
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

    const parsed = await AutoDraftSchema.safeParseAsync(body);

    if (!parsed.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const { userId, quotationDraft } = parsed.data;

    const res: ActionResponse = await quotationsService.saveAutoDraft(
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

// Get latest auto-draft
export const GET = async (req: NextRequest) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const res = await quotationsService.getLatestAutoDraft(Number(userId));

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

// Delete auto-draft
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

    const parsed = UserIdSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const { userId } = parsed.data;

    const res: ActionResponse = await quotationsService.deleteAutoDraft(userId);

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