"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: number[];
}

const RoleGuard = ({ children, allowedRoles = [1] }: RoleGuardProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role_id && !allowedRoles.includes(session.user.role_id)) {
      router.replace('/dashboard/inventory/sales');
    }
  }, [session, router, allowedRoles]);

  if (session?.user?.role_id && !allowedRoles.includes(session.user.role_id)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;