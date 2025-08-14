import { getAuthSession } from "@/server-actions/auth-actions/auth.actions";
import { SessionService } from "@/services/auth-service/session.service";
import { UserService } from "@/services/user-service/user.service";
import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import { NOT_AUTHORIZED_RESPONSE } from "@/utils/constants.utils";
import { NextRequest, NextResponse } from "next/server";

const userService = new UserService();
const sessionService = new SessionService();

export const POST = async (req: NextRequest) => {
  try {
    const { userTabToken } = await req.json();

    const session = await getAuthSession();

    if (
      !session ||
      !(await sessionService.checkIsUserSessionOk(session)) ||
      !userTabToken
    ) {
      const res: ActionResponse = {
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      };
      return Promise.resolve(
        new NextResponse(JSON.stringify(res), { status: 401 })
      );
    }

    if (!SessionService.checkTabSessionToken(userTabToken)) {
      const res: ActionResponse = {
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      };
      return Promise.resolve(
        new NextResponse(JSON.stringify(res), { status: 401 })
      );
    }

    const res = await userService.checkUserStatusOnHeartbeat(session.user);

    return Promise.resolve(
      new NextResponse(JSON.stringify(res), { status: 200 })
    );
  } catch (err) {
    logger.error(err);

    const res: ActionResponse = {
      status: false,
      message: "Something went wrong",
    };
    return Promise.resolve(
      new NextResponse(JSON.stringify(res), { status: 500 })
    );
  }
};
