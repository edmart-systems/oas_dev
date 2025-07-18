import SignInForm from "@/components/auth/sign-in-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Office X",
  description: "Office Automation System",
};

const LoginPage = () => {
  return <SignInForm />;
};

export default LoginPage;
