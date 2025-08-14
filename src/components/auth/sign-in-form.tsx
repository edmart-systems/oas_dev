"use client";

import { useState } from "react";
import RouterLink from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { paths } from "@/utils/paths.utils";
import { Warning } from "@phosphor-icons/react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Box, CircularProgress } from "@mui/material";
import { validatePassword } from "@/utils/verification-validation.utils";
import nProgress from "nprogress";

const schema = zod.object({
  email: zod.string().min(1, { message: "Email is required" }).email(),
  password: zod.string().min(1, { message: "Password is required" }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  email: "",
  password: "",
} satisfies Values;

const SignInForm = (): JSX.Element => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState<boolean>();

  const [isFetching, setIsFetching] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = async (data: Values) => {
    if (isFetching) return;

    const { email, password } = data;

    if (!validatePassword(password)) {
      setError("root", { message: "Wrong user credentials" });
      toast("Wrong user credentials", { type: "error" });
      return;
    }

    setIsFetching(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      toast("Login Successful", { type: "success" });
      setIsFetching(false);
      nProgress.start();
      return router.refresh();
    }

    if (res?.error) {
      setError("root", { message: "Wrong user credentials" });
      toast("Wrong user credentials", { type: "error" });
      setIsFetching(false);
      return;
    }
  };

  router.prefetch("/auth/register");

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign In</Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{" "}
          <Link
            component={RouterLink}
            href={paths.auth.register}
            underline="hover"
            variant="subtitle2"
          >
            Sign Up
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? (
                  <FormHelperText>{errors.email.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
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
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
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
          <div>
            <Link
              component={RouterLink}
              href={paths.auth.forgotPassword}
              variant="subtitle2"
            >
              Forgot password?
            </Link>
          </div>
          {errors.root && (
            <Alert color="error" icon={<Warning />}>
              {errors.root.message}
            </Alert>
          )}

          <Box sx={{ m: 1, position: "relative" }}>
            <Button
              disabled={isFetching}
              type="submit"
              variant="contained"
              fullWidth
            >
              Sign In
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

export default SignInForm;
