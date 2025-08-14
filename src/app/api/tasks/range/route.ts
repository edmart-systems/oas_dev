// src/app/api/tasks/range/route.ts

import { logger } from "@/logger/default-logger";
import { getAuthSession } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { TasksService } from "@/services/tasks-service/tasks.service";
import { ActionResponse } from "@/types/actions-response.types";
import { ItemRange } from "@/types/other.types";
import { TasksFetchResponse } from "@/types/tasks.types";
import { safeBodyParse } from "@/utils/api-utils/api.utils";
import {
  BAD_REQUEST_RESPONSE,
  INVALID_RANGE_RESPONSE,
  NOT_AUTHORIZED_RESPONSE,
  TASKS_TIME_LOWER_THRESHOLD,
} from "@/utils/constants.utils";
import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";

const tasksService = new TasksService();
const sessionService = new SessionService();

const TasksByRangeSchema = zod.object({
  userId: zod.number(),
});

//Get tasks for a particular range
export const POST = async (req: NextRequest) => {
  const fromTimeStr = req.nextUrl.searchParams.get("f"); //From time
  const toTimeStr = req.nextUrl.searchParams.get("t"); //To time
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    if (
      !fromTimeStr ||
      isNaN(parseInt(fromTimeStr, 10)) ||
      !toTimeStr ||
      isNaN(parseInt(toTimeStr, 10))
    ) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const dateRange: ItemRange = {
      min: parseInt(fromTimeStr, 10),
      max: parseInt(toTimeStr, 10),
    };

    if (
      dateRange.min < TASKS_TIME_LOWER_THRESHOLD ||
      dateRange.max < TASKS_TIME_LOWER_THRESHOLD ||
      dateRange.min >= dateRange.max
    ) {
      return NextResponse.json(INVALID_RANGE_RESPONSE, { status: 400 });
    }

    const body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const parsedData = await TasksByRangeSchema.safeParseAsync(body);

    if (!parsedData.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const resData: ActionResponse<TasksFetchResponse> =
      await tasksService.fetchSpecificPeriodTasks(
        parsedData.data.userId,
        dateRange,
        session.user
      );

    return NextResponse.json(resData, { status: 200 });
  } catch (err) {
    logger.error(err);
    const res: ActionResponse = {
      status: false,
      message: "Something went wrong",
    };
    return NextResponse.json(res, { status: 500 });
  }
};
