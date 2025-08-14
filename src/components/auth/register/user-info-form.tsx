"use client";

import { UserRegInfo } from "@/types/user.types";
import { formatPhoneNumber } from "@/utils/formatters.util";
import { checkDigitsOnly } from "@/utils/verification-validation.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, IconButton, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import { ArrowLeft } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

type Props = {
  handleBack: () => void;
  handleNext: () => void;
  userInfo: UserRegInfo | undefined;
  setUserInfo: Dispatch<SetStateAction<UserRegInfo | undefined>>;
};

const schema = zod.object({
  firstName: zod.string().min(1, { message: "First name is required" }),
  lastName: zod.string().min(1, { message: "Last name is required" }),
  otherName: zod.string(),
  email: zod.string().min(1, { message: "Email is required" }).email(),
  phone: zod.string().min(1, { message: "Phone Number is required" }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  firstName: "",
  lastName: "",
  otherName: "",
  email: "",
  phone: "",
} satisfies Values;

const UserInfoForm = ({
  setUserInfo,
  userInfo,
  handleBack,
  handleNext,
}: Props): JSX.Element => {
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = (data: Values) => {
    try {
      const { firstName, lastName, otherName, email, phone } = data;

      if (!checkDigitsOnly(phone.replace(/ /g, "").replace("+", ""))) {
        throw new Error("Invalid phone number");
      }
      const formattedPhoneNumber = formatPhoneNumber(phone);

      setUserInfo((prev) => ({
        ...prev,
        firstName,
        lastName,
        otherName,
        email,
        phone: formattedPhoneNumber,
      }));
      handleNext();
    } catch (err: any) {
      console.log(err);
      setError("root", { message: err?.message ? err?.message : err });
    }
  };

  const setPrevValues = () => {
    if (!userInfo) return;

    userInfo?.firstName && setValue("firstName", userInfo.firstName);
    userInfo?.lastName && setValue("lastName", userInfo.lastName);
    userInfo?.otherName && setValue("otherName", userInfo.otherName);
    userInfo?.email && setValue("email", userInfo.email);
    userInfo?.phone && setValue("phone", userInfo.phone);
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
          Enter Your Personal Information
        </Typography>
        <IconButton color="primary" disabled={true}>
          <ArrowLeft />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.firstName)}>
                <InputLabel>First Name</InputLabel>
                <OutlinedInput {...field} label="First Name" />
                {errors.firstName ? (
                  <FormHelperText>{errors.firstName.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.lastName)}>
                <InputLabel>Last Name</InputLabel>
                <OutlinedInput {...field} label="Last Name" />
                {errors.lastName ? (
                  <FormHelperText>{errors.lastName.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="otherName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.otherName)}>
                <InputLabel>Other Name</InputLabel>
                <OutlinedInput {...field} label="Other Name" />
                {errors.otherName ? (
                  <FormHelperText>{errors.otherName.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email Address</InputLabel>
                <OutlinedInput {...field} label="Email Address" type="email" />
                {errors.email ? (
                  <FormHelperText>{errors.email.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <FormControl error={Boolean(errors.phone)}>
                <InputLabel>Phone Number</InputLabel>
                <OutlinedInput {...field} label="Phone Number" />
                {errors.phone ? (
                  <FormHelperText>{errors.phone.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          {errors.root ? (
            <Alert color="error">{errors.root.message}</Alert>
          ) : null}
          <Button disabled={false} type="submit" variant="contained">
            Next
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default UserInfoForm;
