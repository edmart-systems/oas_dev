"use server";

import { UserRegInfo } from "@/types/user.types";
import {
  validateEmailAddress,
  validatePhoneNumber,
} from "@/utils/verification-validation.utils";
import {
  ActionResponse,
  isActionResponse,
} from "@/types/actions-response.types";
import { logger } from "@/logger/default-logger";
import { VerificationService } from "../../services/verification-service/verification.service";

const verificationService = new VerificationService();

export const sendEmailVerificationCode = async (
  userInfo: UserRegInfo
): Promise<ActionResponse> => {
  try {
    const { email, firstName, lastName } = userInfo;

    if (!email || !firstName || !lastName || !validateEmailAddress(email)) {
      return Promise.resolve({
        status: false,
        message: "Invalid Inputs",
      });
    }

    const res = await verificationService.emailVerificationHandler(userInfo);

    if (!res) {
      throw new Error("Failed to send email verification OTP");
    }

    if (isActionResponse(res)) {
      return Promise.resolve(res);
    }

    return Promise.resolve({
      status: true,
      message: "Verification email sent successfully",
      data: res,
    });
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Failed to send email. Please enter a valid email address",
    });
  }
};

export const sendSmsVerificationCode = async (
  userInfo: UserRegInfo
): Promise<ActionResponse> => {
  try {
    const { phone, firstName, lastName } = userInfo;

    if (!phone || !firstName || !lastName || !validatePhoneNumber(phone)) {
      return Promise.resolve({
        status: false,
        message: "Invalid Inputs",
      });
    }

    const res = await verificationService.phoneVerificationHandler(userInfo);

    if (!res) {
      throw new Error("Failed to send phone verification OTP");
    }

    if (isActionResponse(res)) {
      return Promise.resolve(res);
    }

    return Promise.resolve({
      status: true,
      message: "Verification email sent successfully",
      data: res,
    });
  } catch (err) {
    logger.error(err);
    return Promise.resolve({
      status: false,
      message: "Something went wrong",
    });
  }
};

// export const verifyUserInputWithHash = async (
//   userInput: string,
//   verHash: VerificationHash
// ): Promise<ActionResponse> => {
//   try {
//     if (userInput.length !== 6 || isNaN(parseInt(userInput))) {
//       return Promise.resolve({
//         status: false,
//         message: "Invalid verification code",
//       });
//     }

//     const isOkay = await bcrypt.compare(userInput, verHash.hash);

//     if (!isOkay) {
//       return Promise.resolve({
//         status: false,
//         message: "Invalid verification code",
//       });
//     }

//     return Promise.resolve({
//       status: true,
//       message: "Successful",
//     });
//   } catch (err) {
//     logger.error(err);
//     return Promise.resolve({
//       status: false,
//       message: "Something went wrong",
//     });
//   }
// };
