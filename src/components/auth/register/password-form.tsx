"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import { ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";
import { Box, IconButton, Typography } from "@mui/material";
import { UserRegPass } from "@/types/user.types";

type Props = {
  handleBack: () => void;
  handleNext: () => void;
  userPass: UserRegPass | undefined;
  setUserPass: Dispatch<SetStateAction<UserRegPass | undefined>>;
};

const schema = zod
  .object({
    password: zod
      .string()
      .regex(/(?=.*[0-9])/, {
        message: "Password must contain at least one number",
      })
      .regex(/(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least one special character",
      })
      .regex(/(?=.*[a-z])/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/(?=.*[A-Z])/, {
        message: "Password must contain at least one uppercase letter",
      })
      .min(8, { message: "Password must be at least 8 characters long" }),
    password2: zod
      .string()
      .regex(/(?=.*[0-9])/, {
        message: "Password must contain at least one number",
      })
      .regex(/(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least one special character",
      })
      .regex(/(?=.*[a-z])/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/(?=.*[A-Z])/, {
        message: "Password must contain at least one uppercase letter",
      })
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.password === data.password2, {
    path: ["password2"],
    message: "Passwords do not match",
  });

type Values = zod.infer<typeof schema>;

const defaultValues = {
  password: "",
  password2: "",
} satisfies Values;

const PasswordForm = ({
  setUserPass,
  userPass,
  handleBack,
  handleNext,
}: Props): JSX.Element => {
  const [showPassword, setShowPassword] = useState<boolean>();
  const [showPassword2, setShowPassword2] = useState<boolean>();

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = (data: Values) => {
    const { password, password2 } = data;

    if (password.length < 8) {
      return setError("password", {
        message: "Password must be at least 8 characters long",
      });
    }
    if (password2.length < 8) {
      return setError("password2", {
        message: "Password must be at least 8 characters long",
      });
    }
    if (password !== password2) {
      return setError("password2", { message: "Passwords do not match" });
    }
    const userPass: UserRegPass = {
      pass1: password,
      pass2: password2,
    };
    setUserPass(userPass);
    handleNext();
  };

  const setPrevValues = () => {
    if (!userPass) return;
    setValue("password", userPass.pass1);
    setValue("password2", userPass.pass2);
  };

  useEffect(() => setPrevValues(), []);

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
          Set Your Password
        </Typography>
        <IconButton color="primary" onClick={() => handleBack()}>
          <ArrowLeft />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  autoComplete="new-password"
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <Eye
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlash
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? "text" : "password"}
                />
                {errors.password ? (
                  <FormHelperText>{errors.password.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password2"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password2)}>
                <InputLabel>Confirm Password</InputLabel>
                <OutlinedInput
                  autoComplete="new-password"
                  {...field}
                  endAdornment={
                    showPassword2 ? (
                      <Eye
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword2(false);
                        }}
                      />
                    ) : (
                      <EyeSlash
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword2(true);
                        }}
                      />
                    )
                  }
                  label="Confirm Password"
                  type={showPassword2 ? "text" : "password"}
                />
                {errors.password2 ? (
                  <FormHelperText>{errors.password2.message}</FormHelperText>
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

export default PasswordForm;
