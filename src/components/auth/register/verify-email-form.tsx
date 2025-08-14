"use client";

import { sendEmailVerificationCode } from "@/server-actions/verification-actions/verification.actions";
import { ActionResponse } from "@/types/actions-response.types";
import { UserRegInfo } from "@/types/user.types";
import { VerificationHash } from "@/types/verification.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z as zod } from "zod";
import VerifyEmailSmsDialog from "./verify-email-sms-dialog";
import { checkCredentialsExistence } from "@/server-actions/user-actions/user.actions";

type Props = {
  handleBack: () => void;
  handleNext: () => void;
  userInfo: UserRegInfo | undefined;
  setUserInfo: Dispatch<SetStateAction<UserRegInfo | undefined>>;
};

const schema = zod.object({
  email: zod.string().min(1, { message: "Email is required" }).email(),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  email: "",
} satisfies Values;

const VerifyEmailForm = ({
  setUserInfo,
  userInfo,
  handleBack,
  handleNext,
}: Props): JSX.Element => {
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState<boolean>(false);
  const [verHash, setVerHash] = useState<VerificationHash>();
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const onSubmit = async (data: Values) => {
    if (isVerified) {
      handleNext();
      return;
    }

    const { email } = data;

    if (email !== userInfo?.email) {
      return setError("email", {
        message: "Unknown Email Address",
      });
    }

    setIsFetching(true);
    // toast("Sending verification code to your email address", {
    //   type: "info",
    // });

    const userExistingRes: ActionResponse = await checkCredentialsExistence({
      email: email,
    });

    if (userExistingRes.status) {
      setError("root", {
        message: userExistingRes.message,
      });
      toast(userExistingRes.message, {
        type: "error",
      });
      return setIsFetching(false);
    }

    const res: ActionResponse = await sendEmailVerificationCode(userInfo);

    if (!res.status) {
      setError("root", {
        message: res.message,
      });
      toast(res.message, {
        type: "error",
      });
      return setIsFetching(false);
    }

    if (!res.data) {
      setError("root", {
        message: res.message,
      });
      return toast("Something went wrong", {
        type: "error",
      });
    }
    toast("Verification email sent successfully", {
      type: "success",
    });

    const _verHash: VerificationHash = res.data as VerificationHash;
    setVerHash(_verHash);
    setVerifyDialogOpen(true);
    setIsFetching(false);
  };

  const verificationDoneHandler = () => {
    setUserInfo((prev) => ({
      ...prev,
      emailVerified: true,
      verifiedEmail: userInfo?.email,
    }));
    setIsVerified(true);
    handleNext();
    return;
  };

  const setPrevValues = () => {
    if (!userInfo) return;

    userInfo.email && setValue("email", userInfo.email);

    if (userInfo.emailVerified && userInfo.email === userInfo.verifiedEmail) {
      setIsVerified(userInfo?.emailVerified);
    }
  };

  useEffect(() => {
    setPrevValues();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        flexDirection: "column",
        pt: 3,
        minHeight: "300px",
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
        mb={1}
      >
        <Typography color="text.secondary" variant="body2">
          Let&apos;s Verify Your email address
        </Typography>
        <IconButton
          color="primary"
          disabled={isFetching}
          onClick={() => handleBack()}
        >
          <ArrowLeft />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput
                  {...field}
                  label="Email address"
                  type="email"
                  disabled={true}
                />
                {errors.email ? (
                  <FormHelperText>{errors.email.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          {errors.root ? (
            <Alert color="error">{errors.root.message}</Alert>
          ) : null}

          <Box sx={{ m: 1, position: "relative" }}>
            <Button
              disabled={isFetching}
              type="submit"
              variant="contained"
              fullWidth
              color={isVerified ? "success" : "primary"}
              startIcon={isVerified && <CheckCircle />}
            >
              {isVerified ? "Verified" : "Verify"}
            </Button>
            {isFetching && (
              <CircularProgress
                size={24}
                sx={{
                  color: "#D98219",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                }}
              />
            )}
          </Box>

          {isVerified && (
            <Alert color="success" icon={<CheckCircle />}>
              Email Is Already Verified
            </Alert>
          )}
        </Stack>
      </form>

      {verifyDialogOpen && userInfo && verHash && (
        <VerifyEmailSmsDialog
          type="email"
          userInfo={userInfo}
          isOpen={verifyDialogOpen}
          setOpen={setVerifyDialogOpen}
          verificationHash={verHash}
          verificationDoneHandler={verificationDoneHandler}
        />
      )}
    </Box>
  );
};

export default VerifyEmailForm;
