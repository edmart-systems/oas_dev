import { logger } from "@/logger/default-logger";
import prisma from "../../../db/db";
import { UserRepository } from "./user.repository";
import { CheckUserExistenceType } from "@/types/verification.types";
import {
  FullUser,
  HeartbeatResponseData,
  NewUser,
  PendingUserActivationData,
  SimpleUserDtoType,
  SingleUserPageData,
  SummarizedUser,
  UserRegInfo,
  UserRegPass,
  UserRoleKey,
  UsersAndStatusCounts,
  UserStatus,
  UserStatusDto,
} from "@/types/user.types";
import { Status, User } from "@prisma/client";
import {
  capitalizeFirstLetter,
  formatPhoneNumber,
} from "@/utils/formatters.util";
import bcrypt from "bcryptjs";
import { ActionResponse } from "@/types/actions-response.types";
import {
  validateCompanyId,
  validateEmailAddress,
  validatePhoneNumber,
  validateUserName,
} from "@/utils/verification-validation.utils";
import {
  sendAccountApprovedEmail,
  sendNewAccountEmail,
  sendPasswordResetEmail,
  sendPasswordChangedNotificationEmail,
} from "@/comm/emails/user.emails";
import { Session } from "next-auth";
import { SingleQuotationPageData } from "@/types/quotations.types";
import { SessionUser } from "../../server-actions/auth-actions/auth.actions";
import { NotificationService } from "../notification-service/notification.service";
import { NOT_AUTHORIZED_RESPONSE } from "@/utils/constants.utils";
import crypto from "crypto";
import { validatePassword } from "@/utils/verification-validation.utils";

export class UserService {
  private readonly userRepo = new UserRepository(prisma);

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
  constructor() { }

  createNewUser = async ({
    newUserInfo,
    userPass,
  }: {
    newUserInfo: UserRegInfo;
    userPass: UserRegPass;
  }): Promise<ActionResponse> => {
    try {
      const {
        firstName,
        lastName,
        otherName,
        email,
        phone,
        tcsAgreement,
        emailVerified,
        phoneVerified,
      } = newUserInfo;
      const { pass1, pass2 } = userPass;

      if (!tcsAgreement) {
        return Promise.resolve({
          status: false,
          message: "You must accept the terms and conditions",
        });
      }

      if (!email || !validateEmailAddress(email)) {
        return Promise.resolve({
          status: false,
          message: "Invalid User Email",
        });
      }

      if (!phone || !validatePhoneNumber(phone)) {
        return Promise.resolve({
          status: false,
          message: "Invalid Phone Number",
        });
      }

      if (!emailVerified) {
        return Promise.resolve({
          status: false,
          message: "User email must be verified",
        });
      }

      if (!validateUserName(firstName, lastName, otherName)) {
        return Promise.resolve({
          status: false,
          message: "Invalid user name",
        });
      }

      const isUserExisting = await this.isUserExisting({ email, phone });

      if (isUserExisting) {
        return Promise.resolve({
          status: false,
          message: "User is already registered on the system",
        });
      }

      const formattedPhoneNumber = formatPhoneNumber(phone);
      const co_user_id: string = await this.generateCompanyId({
        firstTime: true,
      });
      const hash: string = await bcrypt.hash(pass1, 2);
      const role: number = 2;
      const status: number = 3;

      const newUser: NewUser = {
        co_user_id: co_user_id,
        firstName: firstName!.trim(),
        lastName: lastName!.trim(),
        otherName: otherName?.trim() ?? null,
        email: email,
        phone_number: formattedPhoneNumber,
        role_id: role,
        status_id: status,
        hash: hash,
        email_verified: emailVerified ? 1 : 0,
        phone_verified: phoneVerified ? 1 : 0,
        profile_picture: null,
        status_reason: null,
        signed: 0,
      };

      const createdUser: User | null = await this.userRepo.createNewUser(
        newUser
      );

      if (!createdUser) {
        return Promise.resolve({
          status: false,
          message: "Failed to create new account",
        });
      }

      sendNewAccountEmail(createdUser);

      return Promise.resolve({
        status: true,
        message: "User created successfully",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  requestPasswordReset = async ({
    email,
  }: {
    email: string;
  }): Promise<ActionResponse> => {
    try {
      if (!email || !validateEmailAddress(email)) {
        return Promise.resolve({
          status: false,
          message: "Invalid email address",
        });
      }

      const user = await this.userRepo.getActiveUserByEmail(email);

      if (!user) {
        return Promise.resolve({
          status: false,
          message: "No active account found with that email address",
        });
      }

      const token = this.generateSecureToken();
      const expires_at = new Date(Date.now() + 15 * 60 * 1000); //15 mins

      const createdReset = await this.userRepo.createPasswordResetToken({
        userId: user.userId,
        token,
        expires_at,
      });

      if (!createdReset) {
        return Promise.resolve({
          status: false,
          message: "Failed to create password reset request",
        });
      }

      const resetLink = `${process.env.NEXTAUTH_URL}/auth/new-password?token=${encodeURIComponent(token)}`;
      const emailSent = await sendPasswordResetEmail({ user, resetLink, expires_at });

      if (!emailSent) {
        return Promise.resolve({
          status: false,
          message: "Failed to send password reset email",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Password reset email sent successfully",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getUserByResetToken = async (token: string): Promise<ActionResponse> => {
    try {
      const resetEntry = await this.userRepo.getPasswordResetByToken(token);
      if (!resetEntry) {
        return { status: false, message: "Invalid or expired reset token" };
      }

      return {
        status: true,
        message: "Token is valid",
        data: {
          firstName: resetEntry.user.firstName,
          email: resetEntry.user.email,
        },
      };
    } catch (err) {
      logger.error(err);
      return { status: false, message: "Something went wrong" };
    }
  };

  resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<ActionResponse> => {
    try {
      if (!validatePassword(newPassword)) {
        return {
          status: false,
          message:
            "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.",
        };
      }
      const resetEntry = await this.userRepo.getPasswordResetByToken(token);
      if (!resetEntry) {
        return { status: false, message: "Invalid or expired reset token" };
      }

      if (resetEntry.expires_at < new Date()) {
        await this.userRepo.deletePasswordResetToken(resetEntry.id);
        return { status: false, message: "Reset token has expired" };
      }

      const user = resetEntry.user;
      if (!user) {
        return { status: false, message: "User linked to token not found" };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updated = await this.userRepo.updateUserPasswordHashById(
        user.userId,
        hashedPassword
      );

      if (!updated) {
        return { status: false, message: "Failed to update password" };
      }

      await this.userRepo.deletePasswordResetToken(resetEntry.id);
      const emailSent = await sendPasswordChangedNotificationEmail(user.email, user.firstName);
      if (!emailSent) {
        logger.error(`Failed to send password changed notification to ${user.email}`);
      }
      return { status: true, message: "Password updated successfully" };
    } catch (err) {
      logger.error(err);
      return { status: false, message: "Something went wrong" };
    }
  };

  getUserByEmail = async (email: string): Promise<User | null> => {
    try {
      return Promise.resolve(await this.userRepo.getUserByEmail(email));
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getUserById = async (userId: string): Promise<ActionResponse<FullUser>> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Unknown User",
        });
      }
      const user: FullUser | null = await this.userRepo.fetchUserByCompanyId(
        userId
      );

      if (!user) {
        return Promise.resolve({
          status: false,
          message: "Not Found",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: user,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  getSingleUserPageData = async (
    userId: string
  ): Promise<ActionResponse<SingleUserPageData>> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Unknown User",
        });
      }

      const user: FullUser | null = await this.userRepo.fetchUserByCompanyId(
        userId
      );

      if (!user) {
        return Promise.resolve({
          status: false,
          message: "Not Found",
        });
      }

      const userRoles = await this.userRepo.fetchAllUserRoles();

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: {
          user: user,
          userRoles: userRoles,
        },
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  deleteUserHandler = async (userId: string): Promise<ActionResponse> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Unknown User",
        });
      }

      const user = await this.userRepo.fetchUserByCompanyId(userId);

      if (!user) {
        return Promise.resolve({
          status: false,
          message: "Not Found",
        });
      }

      if (user.status.status !== "pending") {
        return Promise.resolve({
          status: false,
          message: "User can't be deleted",
        });
      }

      const deletedUser: User | null = await this.userRepo.deleteUserById(
        userId
      );

      if (!deletedUser) {
        return Promise.resolve({
          status: false,
          message: "Failed to delete user",
        });
      }

      return Promise.resolve({
        status: true,
        message: "User deleted successfully",
        data: this.generateSimpleUserDto(deletedUser),
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  activateUserHandler = async (userId: string): Promise<ActionResponse> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Unknown User",
        });
      }

      const user = await this.userRepo.fetchUserByCompanyId(userId);

      if (!user) {
        return Promise.resolve({
          status: false,
          message: "Not Found",
        });
      }

      if (user.status.status === "active") {
        return Promise.resolve({
          status: false,
          message: "User can't be activated",
        });
      }

      if (user.status.status !== "pending") {
        const activatedUser: User | null = await this.userRepo.activateUserById(
          userId
        );

        if (!activatedUser) {
          return Promise.resolve({
            status: false,
            message: "Failed to activate user",
          });
        }

        return Promise.resolve({
          status: true,
          message: "User activated successfully",
          data: this.generateSimpleUserDto(activatedUser),
        });
      }

      const newCompanyId = await this.generateCompanyId({ firstTime: false });

      const activationData: PendingUserActivationData = {
        co_user_id: newCompanyId,
        old_co_user_id: userId,
      };

      const activatedUser: User | null =
        await this.userRepo.activatePendingUser(activationData);

      if (!activatedUser) {
        return Promise.resolve({
          status: false,
          message: "Failed to activate user",
        });
      }

      sendAccountApprovedEmail(activatedUser);

      return Promise.resolve({
        status: true,
        message: "User activated successfully",
        data: this.generateSimpleUserDto(activatedUser),
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  blockUserHandler = async (
    userId: string,
    reason?: string
  ): Promise<ActionResponse> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Unknown User",
        });
      }

      const user = await this.userRepo.fetchUserByCompanyId(userId);

      if (!user) {
        return Promise.resolve({
          status: false,
          message: "Not Found",
        });
      }

      if (user.status.status !== "active") {
        return Promise.resolve({
          status: false,
          message: "User can't be blocked",
        });
      }

      const blockedUser: User | null = await this.userRepo.blockUserById(
        userId,
        reason
      );

      if (!blockedUser) {
        return Promise.resolve({
          status: false,
          message: "Failed to block user",
        });
      }

      return Promise.resolve({
        status: true,
        message: "User blocked successfully",
        data: this.generateSimpleUserDto(blockedUser),
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  setUserAsLeftHandler = async (
    userId: string,
    reason?: string
  ): Promise<ActionResponse> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Unknown User",
        });
      }

      const user = await this.userRepo.fetchUserByCompanyId(userId);

      if (!user) {
        return Promise.resolve({
          status: false,
          message: "Not Found",
        });
      }

      if (user.status.status !== "active" && user.status.status !== "blocked") {
        return Promise.resolve({
          status: false,
          message: "User can't be set to left",
        });
      }

      const setToLeftUser: User | null = await this.userRepo.setUserAsLeftById(
        userId,
        reason
      );

      if (!setToLeftUser) {
        return Promise.resolve({
          status: false,
          message: "Failed to set user as left",
        });
      }

      return Promise.resolve({
        status: true,
        message: "User successfully set as left",
        data: this.generateSimpleUserDto(setToLeftUser),
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateUserRoleHandler = async (
    userId: string,
    newRoleKey: UserRoleKey,
    workingUserId: string
  ): Promise<ActionResponse> => {
    try {
      if (!validateCompanyId(userId) || !validateCompanyId(workingUserId)) {
        return Promise.resolve({
          status: false,
          message: "Unknown User",
        });
      }

      const workingUser = await this.userRepo.fetchUserByCompanyId(
        workingUserId
      );

      if (!workingUser) {
        return Promise.resolve({
          status: false,
          message: "Unknown operator",
        });
      }

      if (workingUser.role_id !== 1) {
        return Promise.resolve({
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        });
      }

      const user = await this.userRepo.fetchUserByCompanyId(userId);

      if (!user) {
        return Promise.resolve({
          status: false,
          message: "User Not Found",
        });
      }

      const selectedRole = await this.userRepo.fetchUserRoleByName(newRoleKey);

      if (!selectedRole) {
        return Promise.resolve({
          status: false,
          message: "Role Not Found",
        });
      }

      if (user.role_id === selectedRole.role_id) {
        return Promise.resolve({
          status: false,
          message: "Nothing to update",
        });
      }

      if (user.status.status !== "active" && user.status.status !== "blocked") {
        return Promise.resolve({
          status: false,
          message: `User with '${capitalizeFirstLetter(
            user.status.status
          )}' status can not updated role`,
        });
      }

      const updatedUser = await this.userRepo.updateUserRoleById(
        userId,
        selectedRole.role_id
      );

      if (!updatedUser) {
        return Promise.resolve({
          status: false,
          message: "Failed to updated role",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Successful",
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  isUserExisting = async (
    credentials: CheckUserExistenceType
  ): Promise<boolean> =>
    Promise.resolve(await this.userRepo.checkUserExistence(credentials));

  fetchUsers = async (
    status: UserStatus | null
  ): Promise<UsersAndStatusCounts> => {
    try {
      const users = await this.userRepo.fetchUsers(status);
      const usersStatusCount = await this.userRepo.getUserStatusCount();
      return Promise.resolve({ users: users, summary: usersStatusCount });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  generateSimpleUserDto = (user: User): SimpleUserDtoType => {
    const { hash, created_at, updated_at, ...rest } = user;
    return rest;
  };

  generateCompanyId = async ({
    firstTime,
  }: {
    firstTime: boolean;
  }): Promise<string> => {
    try {
      const date = new Date();
      const mmStr = String(date.getMonth() + 1).padStart(2, "0");
      const yy = String(date.getFullYear()).substring(2);
      const firstPart = firstTime ? "TEMP" : "ESUL";
      const secondPart = mmStr + yy;
      const newUserNumber: number =
        (await this.userRepo.countExistingUsers(firstPart + secondPart)) + 1;
      const thirdPart = String(newUserNumber).padStart(3, "0");

      const newUserId = firstPart + secondPart + thirdPart;
      return Promise.resolve(newUserId);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  userCanUpdateOtherUsersAccountStatus = async (
    otherUserId: string,
    session: Session | null
  ): Promise<boolean> => {
    if (!session || session.user.co_user_id === otherUserId) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  };

  checkUserStatusOnHeartbeat = async (
    userSession: SessionUser
  ): Promise<ActionResponse<HeartbeatResponseData>> => {
    try {
      const { co_user_id: userId, status_id, role_id } = userSession;

      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Unknown User",
        });
      }

      const user = await this.userRepo.fetchUserByCompanyId(userId);

      if (!user) {
        return Promise.resolve({
          status: false,
          message: "User Not Found",
        });
      }

      if (role_id !== user.role_id) {
        return Promise.resolve({
          status: false,
          message: "User Role changed",
        });
      }

      if (user.status.status !== "active") {
        const res: ActionResponse<HeartbeatResponseData> = {
          status: false,
          message: "User is not active",
          data: {
            status: {
              status: user.status.status,
              status_id: user.status.status_id,
            },
          },
        };

        return Promise.resolve(res);
      }

      const notificationsCounts =
        await NotificationService.getUserNotificationsCounts(user.userId);

      const res: ActionResponse<HeartbeatResponseData> = {
        status: true,
        message: "User is active",
        data: {
          status: {
            status: user.status.status,
            status_id: user.status.status_id,
          },
          notificationsCounts: notificationsCounts.data,
        },
      };

      return Promise.resolve(res);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  static getUserByCompanyId = async (
    userId: string
  ): Promise<FullUser | null> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve(null);
      }
      const userRepo = new UserRepository(prisma);

      const user: FullUser | null = await userRepo.fetchUserByCompanyId(userId);

      if (!user) {
        return Promise.resolve(null);
      }

      return Promise.resolve(user);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  static getUserById = async (userId: number): Promise<FullUser | null> => {
    try {
      const userRepo = new UserRepository(prisma);

      const user: FullUser | null = await userRepo.fetchUserById(userId);

      if (!user) {
        return Promise.resolve(null);
      }

      return Promise.resolve(user);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  static isUserExisting_static = async (
    credentials: CheckUserExistenceType
  ): Promise<boolean> => {
    const userRepo = new UserRepository(prisma);

    return Promise.resolve(await userRepo.checkUserExistence(credentials));
  };

  fetchSummarizedUsers = async (): Promise<
    ActionResponse<SummarizedUser[]>
  > => {
    const users = await this.userRepo.fetchSummarizedActiveUsers();
    const res: ActionResponse<SummarizedUser[]> = {
      status: true,
      message: "Successful",
      data: users,
    };
    return Promise.resolve(res);
  };
}
