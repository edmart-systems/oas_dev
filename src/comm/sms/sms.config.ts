"use server";

import { logger } from "@/logger/default-logger";
import { SendSmsDto, SmsDualResponseDto } from "@/types/communication.types";

export const sendSms = async (sms: SendSmsDto): Promise<boolean> => {
  try {
    /*
      https://smsdual.info/
      101 => Invalid Username / Password
      102 => Suspicious Activity Detected
      103 => Recipients Not Specified
      104 => Insufficient SMS Credit
      105 => Sender Field cannot be entirely numeric
      106 => Internal Error. Try resending
      107 => Internal Error.DO NOT RESEND
      108 => Message(s) Sent
*/

    const sender = process.env.NEXT_PUBLIC_SMSDUAL_FROM;
    const userName = process.env.NEXT_PUBLIC_SMSDUAL_USERNAME;
    const pass = process.env.NEXT_PUBLIC_SMSDUAL_PASS;

    if (!userName || !pass || !sender) {
      throw new Error("Missing sms credentials");
    }

    const { body, to, from } = sms;

    const txid = (): string => {
      const rand = "" + Math.random() + "" + Math.random() + "" + Math.random();
      return rand.substring(0, 30);
    };

    const url = "https://smsdual.info/bulksms-api.php";

    const data = new FormData();
    data.append("from", sender);
    data.append("message", body);
    data.append("recipients", to);
    data.append("username", userName);
    data.append("password", pass);
    data.append("type", "normal");
    data.append("txid", txid());

    const res = await fetch(url, { method: "POST", body: data });

    const resData: SmsDualResponseDto =
      (await res.json()) as SmsDualResponseDto;

    if (resData.code == 108) {
      return Promise.resolve(true);
    }

    //TODO: Handle other status codes

    return Promise.resolve(false);
  } catch (err) {
    logger.error(err);
    return Promise.resolve(false);
  }
};
