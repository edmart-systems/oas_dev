import { logger } from "@/logger/default-logger";
import { NewSubTasksDtoSchema } from "@/schema-dtos/tasks.dto ";
import { getAuthSession } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { TasksService } from "@/services/tasks-service/tasks.service";
import { ActionResponse } from "@/types/actions-response.types";
import { TaskOut } from "@/types/tasks.types";
import { safeBodyParse } from "@/utils/api-utils/api.utils";
import {
  BAD_REQUEST_RESPONSE,
  NOT_AUTHORIZED_RESPONSE,
} from "@/utils/constants.utils";
import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";

const tasksService = new TasksService();
const sessionService = new SessionService();

const CreateSubTasksSchema = zod.object({
  userId: zod.number(),
  taskId: zod.number(),
  newSubTasks: NewSubTasksDtoSchema,
});

//Record new client's sub tasks
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

    const parsedData = await CreateSubTasksSchema.safeParseAsync(body);

    if (!parsedData.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const resData: ActionResponse<TaskOut> =
      await tasksService.recordNewUserSubTask(
        parsedData.data.newSubTasks,
        parsedData.data.userId,
        parsedData.data.taskId,
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
