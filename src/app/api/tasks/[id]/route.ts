// src/app/api/tasks/[id]/route.ts
import { logger } from "@/logger/default-logger";
import { TaskUpdateDataDtoSchema } from "@/schema-dtos/tasks.dto ";
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

const UpdateTaskSchema = zod.object({
  userId: zod.number(),
  taskData: TaskUpdateDataDtoSchema,
});

const DeleteTaskSchema = zod.object({
  userId: zod.number(),
  taskId: zod.number(),
});

//Update a user task
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const { id: _taskId } = await params;

    if (isNaN(parseInt(String(_taskId), 10))) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const taskId = Number(_taskId);

    const body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    const parsedData = await UpdateTaskSchema.safeParseAsync(body);

    if (!parsedData.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, {
        status: 400,
      });
    }

    if (
      parsedData.data.userId !== session.user.userId ||
      taskId !== parsedData.data.taskData.taskId
    ) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const resData: ActionResponse<TaskOut> = await tasksService.updateUserTask(
      parsedData.data.userId,
      parsedData.data.taskData,
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

//Delete a user task
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, { status: 401 });
    }

    const { id: _taskId } = await params;

    if (isNaN(parseInt(String(_taskId), 10))) {
      return NextResponse.json(BAD_REQUEST_RESPONSE, { status: 400 });
    }

    const taskId = Number(_taskId);

    const body = await safeBodyParse(req);

    if (!body) {
      return NextResponse.json(BAD_REQUEST_RESPONSE + " 1", {
        status: 400,
      });
    }

    const parsedData = await DeleteTaskSchema.safeParseAsync(body);

    if (!parsedData.success) {
      return NextResponse.json(BAD_REQUEST_RESPONSE + " 2", {
        status: 400,
      });
    }

    if (
      parsedData.data.userId !== session.user.userId ||
      taskId !== parsedData.data.taskId
    ) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE + " 3", { status: 401 });
    }

    const resData: ActionResponse<TaskOut> = await tasksService.deleteUserTask(
      parsedData.data.userId,
      taskId,
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
