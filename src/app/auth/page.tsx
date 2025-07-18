import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Auth | Office X",
  description: "Office Automation System",
};

const AuthPage = () => {
  return redirect("/auth/login");
};

export default AuthPage;
