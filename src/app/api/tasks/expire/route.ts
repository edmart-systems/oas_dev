import { logger } from "@/logger/default-logger";
import { getAuthSession } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { TasksService } from "@/services/tasks-service/tasks.service";
import { ActionResponse } from "@/types/actions-response.types";
import { NOT_AUTHORIZED_RESPONSE } from "@/utils/constants.utils";
import { NextRequest, NextResponse } from "next/server";

const tasksService = new TasksService();
const sessionService = new SessionService();

export const POST = async (req: NextRequest) => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return NextResponse.json(NOT_AUTHORIZED_RESPONSE, {
        status: 401,
      });
    }

    const result = await tasksService.lockExpiredTasks();

    const resData: ActionResponse<string> = {
      status: true,
      message: result,
      data: result,
    };

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