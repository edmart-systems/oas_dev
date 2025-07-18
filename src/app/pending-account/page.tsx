import UserPending from "@/components/pending-user/user-pending";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Pending Account | Office X",
  description: "User Pending",
};

const UserPendingPage = () => {
  return <UserPending />;
};

export default UserPendingPage;
