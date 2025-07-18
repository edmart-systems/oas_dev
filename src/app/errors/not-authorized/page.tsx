import { JSX } from "react";
import type { Metadata } from "next";
import NotAuthorized from "@/components/errors/not-authorized";

export const metadata: Metadata = {
  title: "Error | Office X",
  description: "Not Authorized",
};

const NotAuthorizedPage = (): JSX.Element => {
  return <NotAuthorized />;
};

export default NotAuthorizedPage;
