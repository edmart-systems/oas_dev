"use client";

import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Button,
  CircularProgress,
  Box,
  Alert,
  Link,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeSlash, Warning } from "@phosphor-icons/react";
import RouterLink from "next/link";
import { paths } from "@/utils/paths.utils";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction, getUserByResetTokenAction } from "@/server-actions/user-actions/user.actions";
import { useRouter } from "next/navigation";

const schema = zod
  .object({
    password: zod.string().min(1, { message: "Password is required" }),
    confirmPassword: zod
      .string()
      .min(1, { message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Values = zod.infer<typeof schema>;

const defaultValues: Values = {
  password: "",
  confirmPassword: "",
};

const NewPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [userInfo, setUserInfo] = useState<{ firstName: string; email: string } | null>(null);
  useEffect(() => {
    if (token) {
      getUserByResetTokenAction(token).then((res) => {
        if (res.status && res.data) {
          setUserInfo(res.data);
        }
      });
    }
  }, [token]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = React.useCallback(
  async (values: Values): Promise<void> => {
    setIsFetching(true); 
    try {
      if (!token) {
        setError("root", {
          type: "server",
          message: "Reset token missing or invalid.",
        });
        toast.error("Reset token missing or invalid.");
        return;
      }

      const res = await resetPasswordAction(token, values.password);

      if (!res.status) {
        setError("root", {
          type: "server",
          message: res.message || "Failed to reset password.",
        });
        toast.error(res.message || "Failed to reset password.");
      } else {
        toast.success("Password reset successfully!");
        setTimeout(() => {
          router.push(paths.auth.login);
        }, 1500);
      }
    } catch (error) {
      setError("root", {
        type: "server",
        message: "An unexpected error occurred.",
      });
      toast.error("An unexpected error occurred.");
    } finally {
      setIsFetching(false);
    }
  },
  [setError, token]
);


  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">
          Create New Password
        </Typography>

        {userInfo && (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ marginTop: "-8px" }}
          >
            for {userInfo.firstName} ({userInfo.email})
          </Typography>
        )}

        <Typography color="text.secondary" variant="body2">
          Cancel{" "}
          <Link
            component={RouterLink}
            href={paths.auth.login}
            underline="hover"
            variant="subtitle2"
          >
            Login
          </Link>
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {/* New Password */}
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={!!errors.password}>
                <InputLabel>New password</InputLabel>
                <OutlinedInput
                  {...field}
                  label="New password"
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    showPassword ? (
                      <Eye
                        cursor="pointer"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <EyeSlash
                        cursor="pointer"
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  }
                />
                {errors.password && (
                  <FormHelperText>{errors.password.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormControl error={!!errors.confirmPassword}>
                <InputLabel>Confirm password</InputLabel>
                <OutlinedInput
                  {...field}
                  label="Confirm password"
                  type={showConfirm ? "text" : "password"}
                  endAdornment={
                    showConfirm ? (
                      <Eye cursor="pointer" onClick={() => setShowConfirm(false)} />
                    ) : (
                      <EyeSlash cursor="pointer" onClick={() => setShowConfirm(true)} />
                    )
                  }
                />
                {errors.confirmPassword && (
                  <FormHelperText>{errors.confirmPassword.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* Root Error Alert */}
          {errors.root && (
            <Alert color="error" icon={<Warning />}>
              {errors.root.message}
            </Alert>
          )}

          {/* Submit */}
          <Box sx={{ m: 1, position: "relative" }}>
            <Button
              disabled={isFetching}
              type="submit"
              variant="contained"
              fullWidth
            >
              Reset Password
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
        </Stack>
      </form>
    </Stack>
  );
};

export default NewPasswordForm;
