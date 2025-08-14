"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { paths } from "@/utils/paths.utils";
import { signOut, useSession } from "next-auth/react";
import ScreenLoader from "../common/screen-loading";
import { toast } from "react-toastify";
import nProgress from "nprogress";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { resetUser, updateUser } from "@/redux/slices/user.slice";
import { setNotificationsDrawer } from "@/redux/slices/app.slice";
import { clearAllNotifications } from "@/redux/slices/notifications.slice";
import { clearQuotationSearchParams } from "@/redux/slices/quotation-search.slice";
import {
  clearReuseQuotations,
  clearLocalQuotationDrafts,
} from "@/redux/slices/quotation.slice";
import { TAB_SESSION_COOKIE_NAME } from "@/utils/constants.utils";
import { storeTabSessionValue } from "@/utils/client-tab-session.utils";
import { resetTheme } from "@/redux/slices/theme.slice";

export interface GuestGuardProps {
  children: React.ReactNode;
}

const GuestGuard = ({
  children,
}: GuestGuardProps): React.JSX.Element | null => {
  const { user: oldUser } = useAppSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, data } = useSession();

  const resetAppData = () => {
    dispatch(resetUser());
    dispatch(setNotificationsDrawer(false));
    dispatch(clearAllNotifications());
    dispatch(clearQuotationSearchParams());
    dispatch(clearLocalQuotationDrafts());
    dispatch(clearReuseQuotations());
    dispatch(resetTheme());
  };

  const checkPermissions = async (): Promise<void> => {
    if (status == "loading") {
      return;
    }

    if (status == "authenticated" && data) {
      const { status_id, role_id } = data.user;
      nProgress.start();

      if (oldUser && oldUser.co_user_id !== data.user.co_user_id) {
        // console.log("New User login");
        resetAppData();
      }

      dispatch(updateUser(data.user));

      const tabSessionStatus = storeTabSessionValue(
        TAB_SESSION_COOKIE_NAME,
        data.user.tabToken
      );

      if (status_id === 1) {
        return router.replace(paths.dashboard.overview);
      }

      if (status_id === 2) {
        return router.replace(paths.userStatus.blocked);
      }

      if (status_id === 3) {
        return router.replace(paths.userStatus.pending);
      }

      if (status_id === 4) {
        nProgress.start();
        return router.replace(paths.userStatus.inactive);
      }

      await signOut();
      // return router.replace(paths.auth.login);
      return;
    }
  };

  useEffect(() => {
    checkPermissions().catch(() => {
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, [status]);

  if (status == "unauthenticated") {
    return <>{children}</>;
  } else {
    return <ScreenLoader fullScreen />;
  }
};

export default GuestGuard;
