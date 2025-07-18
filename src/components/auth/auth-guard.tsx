"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { paths } from "@/utils/paths.utils";
import { logger } from "@/logger/default-logger";
import { signOut, useSession } from "next-auth/react";
import ScreenLoader from "../common/screen-loading";
import nProgress from "nprogress";
import { toast } from "react-toastify";

export interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps): React.JSX.Element | null => {
  const router = useRouter();
  const { status, data } = useSession();

  const checkPermissions = async (): Promise<void> => {
    if (status == "loading") {
      return;
    }

    if (status == "unauthenticated") {
      // console.log("[AuthGuard]: User is not logged in, redirecting to sign in");
      nProgress.start();
      router.replace(paths.auth.login);
      return;
    }

    if (status == "authenticated" && data) {
      const { status_id, role_id } = data.user;

      // if (status_id === 1) {
      //   return router.replace(paths.dashboard.overview);
      // }

      // alert("Auth Guard");

      if (status_id === 2) {
        nProgress.start();
        return router.replace(paths.userStatus.blocked);
      }

      if (status_id === 3) {
        nProgress.start();
        return router.replace(paths.userStatus.pending);
      }

      if (status_id === 4) {
        nProgress.start();
        return router.replace(paths.userStatus.inactive);
      }

      return;
    }
  };

  useEffect(() => {
    checkPermissions().catch(() => {
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, [status]);

  if (!data) {
    return <ScreenLoader fullScreen />;
  }

  if (status == "authenticated" && data.user.status_id === 1) {
    return <>{children}</>;
  } else {
    return <ScreenLoader fullScreen />;
  }
};

export default AuthGuard;
