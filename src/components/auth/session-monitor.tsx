"use client";

import { userSystemHeartbeatAction } from "@/server-actions/user-actions/user.actions";
import { updateNotificationsCounts } from "@/redux/slices/notifications.slice";
import { useAppDispatch } from "@/redux/store";
import { ActionResponse } from "@/types/actions-response.types";
import { HeartbeatResponseData, UserStatusDto } from "@/types/user.types";
import { getTabSessionValue } from "@/utils/client-tab-session.utils";
import {
  NOT_AUTHORIZED_RESPONSE,
  SESSION_CHECK_HEARTBEAT_INTERVAL_MINUTES,
  TAB_SESSION_COOKIE_NAME,
} from "@/utils/constants.utils";
import { minutesToMilliseconds } from "@/utils/time-converters.utils";
import { isDateExpired } from "@/utils/time.utils";
import { baseUrl } from "@/utils/url.utils";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { Fragment, ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";

type Props = {
  children: ReactNode;
};

const checkIsSessionExpired = (expiryTime: string): boolean => {
  return isDateExpired(expiryTime); // True if Expired
};

export const checkSessionExpiration = async (
  pathName: string,
  sessionData: Session | null,
  dispatch: Dispatch<UnknownAction>
): Promise<void> => {
  try {
    if (!sessionData) {
      return;
    }

    const { expires, user } = sessionData;

    if (checkIsSessionExpired(expires)) {
      alert("This session is expired, please login again.");
      signOut();
      return;
    }

    const tabAliveToken = getTabSessionValue(TAB_SESSION_COOKIE_NAME);

    if (!tabAliveToken) {
      signOut();
      return;
    }

    const uri = baseUrl + "/api/session/user-heartbeat";

    const res = await fetch(uri, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userTabToken: tabAliveToken }),
    });

    if (res.status === 401) {
      signOut();
      return;
    }

    if (res.status === 500 || res.status === 404) {
      return;
    }

    const userStatusRes: ActionResponse<HeartbeatResponseData> =
      await res.json();

    if (userStatusRes.message === NOT_AUTHORIZED_RESPONSE) {
      signOut();
      return;
    }

    if (!userStatusRes.status || !userStatusRes.data) {
      alert("User status changes, please login again.");
      // console.log(userStatusRes.message);
      signOut();
      return;
    }

    const { status, status_id } = userStatusRes.data.status;

    if (pathName.startsWith("/dashboard")) {
      if (status_id === 1) {
        //Logged into the system
        if (userStatusRes.data.notificationsCounts) {
          dispatch(
            updateNotificationsCounts(userStatusRes.data.notificationsCounts)
          );
        }
        return;
      }

      alert("User status changed, please login again.");
      signOut();
      return;
    }

    if (
      pathName.startsWith("/inactive-account") ||
      pathName.startsWith("/pending-account") ||
      pathName.startsWith("/blocked-account")
    ) {
      if (status_id === 1) {
        alert("User status changed, please login again.");
        signOut();
        return;
      }

      return;
    }

    return;
  } catch (err) {
    console.clear();
    // console.log("Failed to check session: ", err);
  }
};

const SessionMonitor = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { data: sessionData } = useSession();
  const pathName = usePathname();

  useEffect(() => {
    checkSessionExpiration(pathName, sessionData, dispatch);

    const timeIntervalId = setInterval(() => {
      checkSessionExpiration(pathName, sessionData, dispatch);
    }, minutesToMilliseconds(SESSION_CHECK_HEARTBEAT_INTERVAL_MINUTES));

    return () => clearInterval(timeIntervalId);
  }, [sessionData, pathName]);

  return <Fragment>{children}</Fragment>;
};

export default SessionMonitor;
