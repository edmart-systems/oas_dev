"use server";

import { SendSmsDto } from "@/types/communication.types";
import { sendSms } from "./sms.config";

export const sendSmsVerificationOtp = async ({
  firstName,
  phone,
  verCode,
}: {
  firstName: string;
  phone: string;
  verCode: number;
}): Promise<boolean> => {
  try {
    const smsData: SendSmsDto = {
      body: `Hello ${firstName}, Your Edmart Office Automation OTP is ${verCode}`,
      to: phone,
    };

    const sendSmsRes = await sendSms(smsData);

    if (!sendSmsRes) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  } catch (err) {
    console.log(err);
    return Promise.resolve(false);
  }
};
