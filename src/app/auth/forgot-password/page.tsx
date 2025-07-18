import ResetPasswordForm from "@/components/auth/reset-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Office X",
  description: "Office Automation System",
};

const ForgotPasswordPage = () => {
  return (
    <>
      <ResetPasswordForm />
    </>
  );
};

export default ForgotPasswordPage;
