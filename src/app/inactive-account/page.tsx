import UserInactive from "@/components/inactive-user/user-inactive";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Inactive Account | Office X",
  description: "User Account Suspended",
};

const UserPendingPage = () => {
  return <UserInactive />;
};

export default UserPendingPage;
