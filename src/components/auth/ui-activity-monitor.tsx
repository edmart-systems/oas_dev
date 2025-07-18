"use client";

import { updateActivityExp } from "@/redux/slices/activity.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  MAXIMUM_UI_INACTIVITY_MINUTES,
  UI_ACTIVITY_HEARTBEAT_INTERVAL_MINUTES,
} from "@/utils/constants.utils";
import { minutesToMilliseconds } from "@/utils/time-converters.utils";
import { isDateExpired } from "@/utils/time.utils";
import { signOut } from "next-auth/react";
import React, { Fragment, ReactNode, useEffect, useState } from "react";
import UiInActivityBackdrop from "../common/ui-inactivity-backdrop";
import { mSignOut } from "@/utils/auth.utils";
import { clearTabSessionValues } from "@/utils/client-tab-session.utils";

type Props = {
  children: ReactNode;
};

const UiActivityMonitor = ({ children }: Props) => {
  const { exp } = useAppSelector((state) => state.activity);
  const dispatch = useAppDispatch();
  const [openWarning, setOpenWarning] = useState<boolean>(false);

  const checkRemainingTime = (expTime: number) => {
    const timeNow = new Date().getTime();
    const remTime = expTime - timeNow;

    if (remTime <= minutesToMilliseconds(MAXIMUM_UI_INACTIVITY_MINUTES) / 10) {
      return setOpenWarning(true);
    }
  };

  const checkActivity = async (expTime: number) => {
    if (isDateExpired(expTime)) {
      try {
        await signOut();
      } catch (err) {
        console.log("Inactivity Sign out Failure 1", err);
        try {
          await signOut();
        } catch (err) {
          console.log("Inactivity Sign out Failure 2", err);
          window.location.reload();
          //TODO: Create manual sign out clearing all cookies and session storage
        }
      }
      return;
    }

    checkRemainingTime(expTime);
  };

  const updateActivity = () => dispatch(updateActivityExp());

  // const clearSessionOnCloseTab = (evt: BeforeUnloadEvent) => {
  //   clearTabSessionValues();
  //   // @ts-ignore
  //   // event.returnValue = "Are you sure you want to leave?";
  // };

  useEffect(() => {
    updateActivity();

    window.addEventListener("click", updateActivity);
    window.addEventListener("keypress", updateActivity);
    window.addEventListener("scrollend", updateActivity);
    // window.addEventListener("beforeunload", clearSessionOnCloseTab);
    // window.addEventListener("visibilitychange", () => {
    //   if (document.visibilityState === "hidden") {
    //     clearTabSessionValues();
    //   }
    // });

    return () => {
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keypress", updateActivity);
      window.removeEventListener("scrollend", updateActivity);
      // window.removeEventListener("beforeunload", clearSessionOnCloseTab);
    };
  }, []);

  useEffect(() => {
    const timeIntervalId = setInterval(
      () => checkActivity(exp),
      minutesToMilliseconds(UI_ACTIVITY_HEARTBEAT_INTERVAL_MINUTES)
    );

    return () => clearInterval(timeIntervalId);
  }, [exp]);

  return (
    <Fragment>
      {children}
      {openWarning && (
        <UiInActivityBackdrop open={openWarning} setOpen={setOpenWarning} />
      )}
    </Fragment>
  );
};

export default UiActivityMonitor;
