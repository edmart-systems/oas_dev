import RegisterStepper from "@/components/auth/register/register-stepper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Office X",
  description: "Office Automation System",
};

const RegisterPage = () => {
  return <RegisterStepper />;
};

export default RegisterPage;
