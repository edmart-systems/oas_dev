import { JSX } from "react";
import type { Metadata } from "next";
import NotFound from "@/components/errors/not-found";

export const metadata: Metadata = {
  title: "Error | Office X",
  description: "Not Found",
};

const NotFoundPage = (): JSX.Element => {
  return <NotFound />;
};

export default NotFoundPage;
