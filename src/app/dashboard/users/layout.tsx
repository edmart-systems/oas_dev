import OnlyManagerGuard from "@/components/access-control.tsx/only-manager-guard";
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const UsersLayout = ({ children }: Props) => {
  return <OnlyManagerGuard>{children}</OnlyManagerGuard>;
};

export default UsersLayout;
