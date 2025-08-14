import NewPasswordForm from "../../../components/auth/new-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Password | Office X",
  description: "Office Automation System",
};

const LoginPage = () => {
  return <NewPasswordForm />;
};

export default LoginPage;
