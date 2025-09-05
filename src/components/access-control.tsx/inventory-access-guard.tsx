"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import React, { ReactNode, useEffect } from "react";
import ScreenLoader from "../common/screen-loading";
import nProgress from "nprogress";

type Props = {
  children: ReactNode;
};

const InventoryAccessGuard = ({ children }: Props) => {
  const { data } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const checkPermissions = () => {
    if (!data) return;

    const { user } = data;

    // Role 2 users can only access sales page
    if (user.role_id === 2 && !pathname.includes('/sales')) {
      nProgress.start();
      router.replace('/dashboard/inventory/sales');
      return;
    }
  };

  useEffect(() => checkPermissions(), [data, pathname]);

  if (!data) {
    return <ScreenLoader />;
  }

  // Role 2 users trying to access non-sales pages
  if (data.user.role_id === 2 && !pathname.includes('/sales')) {
    return <ScreenLoader />;
  }

  return <>{children}</>;
};

export default InventoryAccessGuard;