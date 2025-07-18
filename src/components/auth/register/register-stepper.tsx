"use client";

import { paths } from "@/utils/paths.utils";
import {
  Box,
  Button,
  Divider,
  Link,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Fragment, ReactNode, useState } from "react";
import RouterLink from "next/link";
import UserInfoForm from "./user-info-form";
import PasswordForm from "./password-form";
import VerifyEmailForm from "./verify-email-form";
import VerifyPhoneForm from "./verify-phone-form";
import TCsForm from "./tcs-form";
import { UserRegInfo, UserRegPass } from "@/types/user.types";

type Step = {
  id: number;
  name: string;
  desc?: string;
  element: JSX.Element;
};

const RegisterStepper = () => {
  const [userInfo, setUserInfo] = useState<UserRegInfo>();
  const [userPass, setUserPass] = useState<UserRegPass>();

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    if (activeStep == 0) return;
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    // setActiveStep(0);
  };

  const steps: Step[] = [
    {
      id: 1,
      name: "User Info",
      element: (
        <UserInfoForm
          setUserInfo={setUserInfo}
          userInfo={userInfo}
          handleBack={handleBack}
          handleNext={handleNext}
        />
      ),
      desc: "Enter Your Personal Information",
    },
    {
      id: 2,
      name: "Password",
      element: (
        <PasswordForm
          setUserPass={setUserPass}
          userPass={userPass}
          handleBack={handleBack}
          handleNext={handleNext}
        />
      ),
      desc: "Set Your Password",
    },
    {
      id: 3,
      name: "Terms & Conditions",
      element: (
        <TCsForm
          setUserInfo={setUserInfo}
          userInfo={userInfo}
          handleBack={handleBack}
          handleNext={handleNext}
        />
      ),
      desc: "Our Terms And Conditions",
    },
    {
      id: 4,
      name: "Email Verification",
      element: (
        <VerifyEmailForm
          setUserInfo={setUserInfo}
          userInfo={userInfo}
          handleBack={handleBack}
          handleNext={handleNext}
        />
      ),
      desc: "Let's Verify Your email address",
    },
    {
      id: 5,
      name: "Phone Verification",
      element: (
        <VerifyPhoneForm
          setUserInfo={setUserInfo}
          userInfo={userInfo}
          userPass={userPass}
          handleBack={handleBack}
          handleNext={handleNext}
        />
      ),
      desc: "Let's Verify Your Phone Number",
    },
  ];

  return (
    <Stack spacing={3} sx={{}}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign Up</Typography>
        <Typography color="text.secondary" variant="body2">
          Already have an account?{" "}
          <Link
            component={RouterLink}
            href={paths.auth.login}
            underline="hover"
            variant="subtitle2"
          >
            Sign In
          </Link>
        </Typography>
        <Divider />
        <Box sx={{ width: "100%" }}>
          <Stepper activeStep={activeStep}>
            {steps.map((step, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: ReactNode;
              } = {};

              return (
                <Step key={step.name} {...stepProps}>
                  <StepLabel {...labelProps}>{step.name}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === steps.length ? (
            <Fragment>
              <Typography sx={{ mt: 3, mb: 1 }}>
                Your account has been successfully created.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button variant="contained" href={paths.auth.login}>
                  Go to login
                </Button>
              </Box>
            </Fragment>
          ) : (
            steps[activeStep].element
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

export default RegisterStepper;
