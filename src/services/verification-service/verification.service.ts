import { sendEmailVerificationOtp } from "@/comm/emails/auth.emails";
import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import { UserRegInfo } from "@/types/user.types";
import { VerificationHash } from "@/types/verification.types";
import {
  codeGenerator,
  validateEmailAddress,
  validatePhoneNumber,
} from "@/utils/verification-validation.utils";
import bcrypt from "bcryptjs";
import { sendSmsVerificationOtp } from "@/comm/sms/auth.sms";

export class VerificationService {
  constructor() {}

  emailVerificationHandler = async (
    userInfo: UserRegInfo
  ): Promise<VerificationHash | ActionResponse | null> => {
    try {
      const { email, firstName, lastName } = userInfo;

      if (!email || !firstName || !lastName || !validateEmailAddress(email)) {
        return Promise.resolve({
          status: false,
          message: "Invalid Inputs",
        });
      }

      const verCode: number = codeGenerator(6);
      const hash = await bcrypt.hash(String(verCode), 1);

      const isEmailSent: boolean = await sendEmailVerificationOtp({
        userInfo: userInfo,
        verCode: verCode,
      });

      if (!isEmailSent) {
        logger.error("Failed to send verification email");
        return Promise.resolve(null);
      }

      const verHash: VerificationHash = {
        hash: hash,
      };

      return Promise.resolve(verHash);
    } catch (err) {
      logger.error(err);
      return Promise.resolve(null);
    }
  };

  phoneVerificationHandler = async (
    userInfo: UserRegInfo
  ): Promise<VerificationHash | ActionResponse | null> => {
    try {
      const { phone, firstName, lastName } = userInfo;

      if (!phone || !firstName || !lastName || !validatePhoneNumber(phone)) {
        return Promise.resolve({
          status: false,
          message: "Invalid Inputs",
        });
      }

      const verCode: number = codeGenerator(6);
      const hash = await bcrypt.hash(String(verCode), 1);

      const isSmsSent = await sendSmsVerificationOtp({
        firstName,
        phone,
        verCode,
      });

      if (!isSmsSent) {
        return Promise.resolve({
          status: false,
          message: "Failed to send sms. Please enter an active phone number",
        });
      }

      const verHash: VerificationHash = {
        hash: hash,
      };

      return Promise.resolve(verHash);
    } catch (err) {
      logger.error(err);
      return Promise.resolve(null);
    }
  };
}
