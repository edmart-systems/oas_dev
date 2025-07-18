import { logger } from "@/logger/default-logger";
import { NewTaskDtoSchema } from "@/schema-dtos/tasks.dto ";
import { getAuthSession } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { TasksService } from "@/services/tasks-service/tasks.service";
import { ActionResponse } from "@/types/actions-response.types";
import { TaskOut, TasksFetchResponse } from "@/types/tasks.types";
import { safeBodyParse } from "@/utils/api-utils/api.utils";
import {
  BAD_REQUEST_RESPONSE,
  TASKS_TIME_LOWER_THRESHOLD,
  NOT_AUTHORIZED_RESPONSE,
} from "@/utils/constants.utils";
import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";

const tasksService = new TasksService();
const sessionService = new SessionService();

const CreateTaskSchema = zod.object({
  userId: zod.number(),
  newTask: NewTaskDtoSchema,
});

//Get Client's current month tasks
export const GET = async (req: NextRequest) => {
  const userTimeStr = req.nextUrl.searchParams.get("t"); // User Time in milliseconds
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, {
        status: 401,
      });
    }

    if (!userTimeStr || isNaN(parseInt(userTimeStr, 10))) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const userTime = parseInt(userTimeStr, 10);

    if (userTime < TASKS_TIME_LOWER_THRESHOLD) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const resData: ActionResponse<TasksFetchResponse> =
      await tasksService.fetchThisMonthTasks(session.user.userId, userTime);

    return NextResponse.json(resData, { status: 200 });
  } catch (err) {
    logger.error(err);
    const res: ActionResponse = {
      status: false,
      message: "Something went wrong",
    };
    return new NextResponse(JSON.stringify(res), { status: 500 });
  }
};

//Record new client's task
export const POST = async (req: NextRequest) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const parsedData = await CreateTaskSchema.safeParseAsync(body);

    if (!parsedData.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const resData: ActionResponse<TaskOut> =
      await tasksService.recordNewUserTask(
        parsedData.data.userId,
        parsedData.data.newTask,
        session.user
      );

    return NextResponse.json(resData, { status: 200 });
  } catch (err) {
    logger.error(err);
    const res: ActionResponse = {
      status: false,
      message: "Something went wrong",
    };
    return new NextResponse(JSON.stringify(res), { status: 500 });
  }
};
