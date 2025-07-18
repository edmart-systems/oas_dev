import { logger } from "@/logger/default-logger";
import { getAuthSession } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { QuotationsService } from "@/services/quotations-service/quotations.service";
import { ActionResponse } from "@/types/actions-response.types";
import { safeBodyParse } from "@/utils/api-utils/api.utils";
import {
  BAD_REQUEST_RESPONSE,
  NOT_AUTHORIZED_RESPONSE,
} from "@/utils/constants.utils";
import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";

const quotationsService = new QuotationsService();
const sessionService = new SessionService();

const DeleteSingleQuotationDraftSchema = zod.object({
  userId: zod.number(),
  quotationDraftId: zod.number(),
});

//Delete single user draft
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ draft_id: string }> }
) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const { draft_id } = await params;
    const body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const parsed = DeleteSingleQuotationDraftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const { userId, quotationDraftId } = parsed.data;

    if (draft_id !== String(quotationDraftId)) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const res: ActionResponse = await quotationsService.deleteQuotationDraft(
      userId,
      quotationDraftId
    );

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
