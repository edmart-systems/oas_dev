"use client";

import { sendSmsVerificationCode } from "@/server-actions/verification-actions/verification.actions";
import { ActionResponse } from "@/types/actions-response.types";
import { UserRegInfo, UserRegPass } from "@/types/user.types";
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
import {
  checkCredentialsExistence,
  createUserAccount,
} from "@/server-actions/user-actions/user.actions";

type Props = {
  handleBack: () => void;
  handleNext: () => void;
  userInfo: UserRegInfo | undefined;
  userPass: UserRegPass | undefined;
  setUserInfo: Dispatch<SetStateAction<UserRegInfo | undefined>>;
};

const schema = zod.object({
  phone: zod.string().min(1, { message: "Phone Number is required" }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  phone: "",
} satisfies Values;

const VerifyPhoneForm = ({
  setUserInfo,
  userInfo,
  userPass,
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
      createUserAccountHandler({ phoneVerified: true });
      return;
    }

    const { phone } = data;

    if (phone !== userInfo?.phone) {
      return setError("phone", {
        message: "Unknown phone number",
      });
    }

    setIsFetching(true);
    // toast("Sending verification code to your phone number", {
    //   type: "info",
    // });

    const userExistingRes: ActionResponse = await checkCredentialsExistence({
      phone: phone,
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

    const res: ActionResponse = await sendSmsVerificationCode(userInfo);

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
    toast("Verification sms sent successfully", {
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
      phoneVerified: true,
      verifiedPhone: userInfo?.phone,
    }));
    setIsVerified(true);

    createUserAccountHandler({ phoneVerified: true });
    return;
  };

  const setPrevValues = () => {
    if (!userInfo) return;

    userInfo.phone && setValue("phone", userInfo.phone);

    if (userInfo.phoneVerified && userInfo.phone === userInfo.verifiedPhone) {
      setIsVerified(userInfo?.phoneVerified);
    }
  };

  const skipHandler = () => {
    createUserAccountHandler({ phoneVerified: false });
  };

  const createUserAccountHandler = async ({
    phoneVerified,
  }: {
    phoneVerified: boolean;
  }) => {
    try {
      if (!userInfo || !userPass) return;

      setIsFetching(true);
      // toast("Creating User Account", {
      //   type: "info",
      // });

      const res: ActionResponse = await createUserAccount(
        phoneVerified
          ? { ...userInfo, phoneVerified: true, verifiedPhone: userInfo.phone }
          : userInfo,
        userPass
      );

      if (!res.status) {
        setError("root", {
          message: res.message,
        });
        toast(res.message, {
          type: "error",
        });
        return setIsFetching(false);
      }

      toast("User Account Created Successfully", {
        type: "success",
      });

      handleNext();
    } catch (err) {
      console.log(err);
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
          Let&apos;s Verify Your Phone Number{" "}
          <span style={{ cursor: "pointer" }} onClick={() => skipHandler()}>
            <strong>(or skip)</strong>
          </span>
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
            name="phone"
            render={({ field }) => (
              <FormControl error={Boolean(errors.phone)}>
                <InputLabel>Phone Number</InputLabel>
                <OutlinedInput
                  {...field}
                  label="Phone Number"
                  disabled={true}
                />
                {errors.phone ? (
                  <FormHelperText>{errors.phone.message}</FormHelperText>
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
              Phone Number Is Already Verified
            </Alert>
          )}
        </Stack>
      </form>

      {verifyDialogOpen && userInfo && verHash && (
        <VerifyEmailSmsDialog
          type="sms"
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

export default VerifyPhoneForm;
