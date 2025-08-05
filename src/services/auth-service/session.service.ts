// src/services/auth-service/session.service.ts
import { Session } from "next-auth";
import jwt from "jsonwebtoken";
import { logger } from "@/logger/default-logger";

export class SessionService {
  isUserSessionManager = async (session: Session | null): Promise<boolean> => {
    if (!session || session.user.role_id !== 1) {
      return Promise.resolve(false);
    }

    if (this.checkIsSessionExpired(session)) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  };

  checkIsUserSessionOk = async (session: Session | null): Promise<boolean> => {
    if (!session) {
      return Promise.resolve(false);
    }

    if (this.checkIsSessionExpired(session)) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  };

  private checkIsSessionExpired = (session: Session): boolean => {
    const { expires } = session;
    const now = new Date().getTime();
    const expiry = new Date(expires).getTime();
    return expiry < now; // True if Expired
  };

  static generateTabSessionToken = (): string => {
    const id = process.env.NEXT_PUBLIC_SESSION_COOKIE_ID;
    const key = process.env.NEXT_PUBLIC_SESSION_COOKIE_KEY;

    if (!id || !key) {
      throw new Error("Tab Session Key or Id Missing");
    }

    const token = jwt.sign(
      {
        id: id,
      },
      key,
      { expiresIn: "3h" }
    );

    return token;
  };

  static checkTabSessionToken = (token: string): boolean => {
    try {
      if (!token) {
        return false;
      }

      const id = process.env.NEXT_PUBLIC_SESSION_COOKIE_ID;
      const key = process.env.NEXT_PUBLIC_SESSION_COOKIE_KEY;

      if (!id || !key) {
        throw new Error("Tab Session Key or Id Missing");
        return false;
      }

      let res1 = { id: "" };

      try {
        res1 = jwt.verify(token, key) as { id: string };
      } catch (err) {}

      return res1.id === id;
    } catch (err) {
      logger.error(err);
      return false;
    }
  };
}
