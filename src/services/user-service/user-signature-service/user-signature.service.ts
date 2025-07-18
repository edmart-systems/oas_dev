import {
  NewSignatureData,
  SignatureDimensions,
  UserSignatureDto,
} from "@/types/user.types";
import prisma from "../../../../db/db";
import { UserRepository } from "../user.repository";
import { logger } from "@/logger/default-logger";
import { validateCompanyId } from "@/utils/verification-validation.utils";
import { ActionResponse } from "@/types/actions-response.types";
import { NOT_AUTHORIZED_RESPONSE } from "@/utils/constants.utils";

export class UserSignatureService {
  private readonly userRepo = new UserRepository(prisma);
  constructor() {}

  getUserSignature = async (
    userId: string
  ): Promise<ActionResponse<UserSignatureDto>> => {
    try {
      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Bad Request",
        });
      }

      const currentSignature = await this.userRepo.fetchUserSignature(userId);

      if (!currentSignature) {
        return Promise.resolve({
          status: false,
          message: "Signature Not Found",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: currentSignature,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  recordUserSignature = async (
    signature: NewSignatureData
  ): Promise<ActionResponse<UserSignatureDto>> => {
    try {
      const { userId } = signature;

      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Bad Request",
        });
      }

      const updatedSignature = await this.userRepo.saveUserSignature(signature);

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: updatedSignature,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateUserSignature = async (
    signature: NewSignatureData
  ): Promise<ActionResponse<UserSignatureDto>> => {
    try {
      const { userId } = signature;

      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Bad Request",
        });
      }

      const currentSignature = await this.userRepo.fetchUserSignature(userId);

      if (!currentSignature) {
        return Promise.resolve({
          status: false,
          message: "Signature Not Found",
        });
      }

      const { canUpdate } = currentSignature;

      if (canUpdate !== 1) {
        return Promise.resolve({
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        });
      }

      const updatedSignature = await this.userRepo.updateUserSignature(
        signature
      );

      if (!updatedSignature) {
        return Promise.resolve({
          status: false,
          message: "Failed to update",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: updatedSignature,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  updateUserSignatureDimensions = async (
    updateData: SignatureDimensions
  ): Promise<ActionResponse<UserSignatureDto>> => {
    try {
      const { userId } = updateData;

      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Bad Request",
        });
      }

      const currentSignature = await this.userRepo.fetchUserSignature(userId);

      if (!currentSignature) {
        return Promise.resolve({
          status: false,
          message: "Signature Not Found",
        });
      }

      const { canUpdate } = currentSignature;

      if (canUpdate !== 1) {
        return Promise.resolve({
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        });
      }

      const updatedSignature =
        await this.userRepo.updateUserSignatureDimensions(updateData);

      if (!updatedSignature) {
        return Promise.resolve({
          status: false,
          message: "Failed to update",
        });
      }

      return Promise.resolve({
        status: true,
        message: "Successful",
        data: updatedSignature,
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  };

  allowUserUpdateSignature = async (
    userId: string,
    thisUserId: string
  ): Promise<ActionResponse> => {
    try {
      if (!validateCompanyId(thisUserId)) {
        return Promise.resolve({
          status: false,
          message: "Bad Request",
        });
      }

      if (!validateCompanyId(userId)) {
        return Promise.resolve({
          status: false,
          message: "Bad Request",
        });
      }

      const thisUser = await this.userRepo.fetchUserByCompanyId(thisUserId);

      if (!thisUser) {
        return Promise.resolve({
          status: false,
          message: "Signature Not Found",
        });
      }

      if (thisUser.role_id !== 1) {
        return Promise.resolve({
          status: false,
          message: NOT_AUTHORIZED_RESPONSE,
        });
      }

      const updatedSignature = await this.userRepo.allowUserUpdateSignature(
        userId
      );

      if (!updatedSignature) {
        return Promise.resolve({
          status: false,
          message: "Failed to update signature",
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
}
