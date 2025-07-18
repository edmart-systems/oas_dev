"use client";

import { paths } from "@/utils/paths.utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";
import ScreenLoader from "../common/screen-loading";
import nProgress from "nprogress";

type Props = {
  children: ReactNode;
};

const OnlyManagerGuard = ({ children }: Props) => {
  const { data } = useSession();
  const router = useRouter();

  const checkPermissions = () => {
    if (!data) return;

    const { user } = data;

    if (user.role_id !== 1) {
      nProgress.start();
      router.replace(paths.dashboard.overview);
      return;
    }
  };

  useEffect(() => checkPermissions(), [data]);

  if (!data || data.user.role_id !== 1) {
    return <ScreenLoader />;
  }

  return <>{children}</>;
};

export default OnlyManagerGuard;
