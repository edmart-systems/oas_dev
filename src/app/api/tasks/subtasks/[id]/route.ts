import { logger } from "@/logger/default-logger";
import { SubTaskUpdateDataDtoSchema } from "@/schema-dtos/tasks.dto ";
import { getAuthSession } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { TasksService } from "@/services/tasks-service/tasks.service";
import { ActionResponse } from "@/types/actions-response.types";
import { SubTaskOut, TaskOut } from "@/types/tasks.types";
import { safeBodyParse } from "@/utils/api-utils/api.utils";
import {
  BAD_REQUEST_RESPONSE,
  NOT_AUTHORIZED_RESPONSE,
} from "@/utils/constants.utils";
import { NextRequest, NextResponse } from "next/server";
import { z as zod } from "zod";

const tasksService = new TasksService();
const sessionService = new SessionService();

const UpdateSubTaskSchema = zod.object({
  userId: zod.number(),
  subTaskData: SubTaskUpdateDataDtoSchema,
});

const DeleteSubTaskSchema = zod.object({
  userId: zod.number(),
  taskId: zod.number(),
  subTaskId: zod.number(),
});

//Update a user sub task
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const { id: _subTaskId } = await params;

    if (isNaN(parseInt(String(_subTaskId), 10))) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const subTaskId = Number(_subTaskId);

    const body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const parsedData = await UpdateSubTaskSchema.safeParseAsync(body);

    if (!parsedData.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    if (
      parsedData.data.userId !== session.user.userId ||
      subTaskId !== parsedData.data.subTaskData.subTaskId
    ) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const resData: ActionResponse<TaskOut> =
      await tasksService.updateUserSubTask(
        parsedData.data.userId,
        parsedData.data.subTaskData,
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

//Delete a user sub task
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const { id: _subTaskId } = await params;

    if (isNaN(parseInt(String(_subTaskId), 10))) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const subTaskId = Number(_subTaskId);

    const body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const parsedData = await DeleteSubTaskSchema.safeParseAsync(body);

    if (!parsedData.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    if (
      parsedData.data.userId !== session.user.userId ||
      subTaskId !== parsedData.data.subTaskId
    ) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const resData: ActionResponse<SubTaskOut> =
      await tasksService.deleteUserSubTask(
        parsedData.data.userId,
        parsedData.data.taskId,
        subTaskId,
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
