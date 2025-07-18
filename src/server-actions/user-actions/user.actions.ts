"use server";

import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import {
  HeartbeatResponseData,
  SingleUserPageData,
  SummarizedUser,
  UserRegInfo,
  UserRegPass,
  UserRoleKey,
  UsersAndStatusCounts,
  UserStatus,
  UserStatusDto,
} from "@/types/user.types";
import { CheckUserExistenceType } from "@/types/verification.types";
import { UserService } from "../../services/user-service/user.service";
import { getAuthSession } from "../auth-actions/auth.actions";
import { revalidatePath } from "next/cache";
import { paths } from "@/utils/paths.utils";
import { SessionService } from "../../services/auth-service/session.service";
import { NOT_AUTHORIZED_RESPONSE } from "@/utils/constants.utils";

const userService = new UserService();
const sessionService = new SessionService();

export const checkCredentialsExistence = async (
  credentials: CheckUserExistenceType
): Promise<ActionResponse> => {
  try {
    if (!credentials.email && !credentials.phone) {
      throw new Error("Invalid Credentials");
    }
    const isUserExisting = await userService.isUserExisting(credentials);

    if (isUserExisting) {
      return Promise.resolve({
        status: true,
        message: credentials.email
          ? "Email address is already registered on the system"
          : credentials.phone
          ? "Phone number is already registered on the system"
          : "User is already registered on the system",
      });
    }

    return Promise.resolve({
      status: false,
      message: "User not existing",
    });
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const createUserAccount = async (
  newUserInfo: UserRegInfo,
  userPass: UserRegPass
): Promise<ActionResponse> => {
  try {
    const res: ActionResponse = await userService.createNewUser({
      newUserInfo,
      userPass,
    });

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const fetchAllUsers = async (
  status: UserStatus | null
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.isUserSessionManager(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const usersData: UsersAndStatusCounts = await userService.fetchUsers(
      status
    );

    return Promise.resolve({
      status: true,
      message: "Successful",
      data: usersData,
    });
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const fetchSingleUser = async (
  userId: string
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.isUserSessionManager(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const userData: ActionResponse = await userService.getUserById(userId);

    return Promise.resolve(userData);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const activateUserAction = async (
  userId: string
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.isUserSessionManager(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    if (
      !(await userService.userCanUpdateOtherUsersAccountStatus(userId, session))
    ) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const activateUserActionResponse = await userService.activateUserHandler(
      userId
    );

    revalidatePath(paths.dashboard.users.main + "/[id]", "page");
    return Promise.resolve(activateUserActionResponse);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const deleteUserAction = async (
  userId: string
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.isUserSessionManager(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    if (
      !(await userService.userCanUpdateOtherUsersAccountStatus(userId, session))
    ) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const deleteActionResponse = await userService.deleteUserHandler(userId);

    revalidatePath(paths.dashboard.users.main + "/[id]", "page");
    return Promise.resolve(deleteActionResponse);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const blockUserAction = async (
  userId: string,
  reason?: string
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.isUserSessionManager(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    if (
      !(await userService.userCanUpdateOtherUsersAccountStatus(userId, session))
    ) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const blockActionResponse = await userService.blockUserHandler(
      userId,
      reason
    );

    revalidatePath(paths.dashboard.users.main + "/[id]", "page");
    return Promise.resolve(blockActionResponse);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const setUserAsLeftAction = async (
  userId: string,
  reason?: string
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.isUserSessionManager(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    if (
      !(await userService.userCanUpdateOtherUsersAccountStatus(userId, session))
    ) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const setLeftActionResponse = await userService.setUserAsLeftHandler(
      userId,
      reason
    );

    revalidatePath(paths.dashboard.users.main + "/[id]", "page");
    return Promise.resolve(setLeftActionResponse);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const userSystemHeartbeatAction = async (
  userId: string,
  userTabToken: string
): Promise<ActionResponse<HeartbeatResponseData>> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    if (!SessionService.checkTabSessionToken(userTabToken)) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res = await userService.checkUserStatusOnHeartbeat(session.user);

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const fetchSingleUserPageData = async (
  userId: string
): Promise<ActionResponse<SingleUserPageData>> => {
  try {
    const session = await getAuthSession();

    if (!(await sessionService.isUserSessionManager(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const userData: ActionResponse = await userService.getSingleUserPageData(
      userId
    );

    return Promise.resolve(userData);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const updateUserRole = async (
  userId: string,
  newRole: UserRoleKey
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.isUserSessionManager(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    if (
      !(await userService.userCanUpdateOtherUsersAccountStatus(userId, session))
    ) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const activateUserActionResponse = await userService.updateUserRoleHandler(
      userId,
      newRole,
      session.user.co_user_id
    );

    revalidatePath(paths.dashboard.users.main + "/[id]", "page");
    return Promise.resolve(activateUserActionResponse);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const fetchSummarizedUsersAction = async (): Promise<
  ActionResponse<SummarizedUser[]>
> => {
  try {
    const session = await getAuthSession();

    if (!session || !(await sessionService.checkIsUserSessionOk(session))) {
      return Promise.resolve({
        status: false,
        message: NOT_AUTHORIZED_RESPONSE,
      });
    }

    const res = await userService.fetchSummarizedUsers();

    return Promise.resolve(res);
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};
