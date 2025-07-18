"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import Stack from "@mui/material/Stack";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import Link from "next/link";
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Typography,
} from "@mui/material";
import { ArrowLeft } from "@phosphor-icons/react";
import { UserRegInfo } from "@/types/user.types";
import { paths } from "@/utils/paths.utils";

type Props = {
  handleBack: () => void;
  handleNext: () => void;
  userInfo: UserRegInfo | undefined;
  setUserInfo: Dispatch<SetStateAction<UserRegInfo | undefined>>;
};

const schema = zod.object({
  terms: zod
    .boolean()
    .refine((value) => value, "You must accept the terms and conditions"),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  terms: false,
} satisfies Values;

const TCsForm = ({
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
  const [isManuallyChecked, setIsManuallyChecked] = useState<boolean>(false);
  const onSubmit = (data: Values) => {
    const { terms } = data;

    if (!terms) {
      return setError("terms", {
        message: "You must accept the terms and conditions",
      });
    }

    setUserInfo((prev) => ({
      ...prev,
      tcsAgreement: true,
    }));

    handleNext();
  };

  const setPrevValues = () => {
    if (!userInfo || !userInfo.tcsAgreement) return;
    setValue("terms", userInfo.tcsAgreement);
    setIsManuallyChecked(true);
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
          Our Terms And Conditions
        </Typography>
        <IconButton color="primary" onClick={() => handleBack()}>
          <ArrowLeft />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="terms"
            render={({ field }) => {
              return (
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value || isManuallyChecked}
                      />
                    }
                    label={
                      <Box display="flex" gap={0.6}>
                        <Typography>I have read and accept the </Typography>
                        <Link
                          href={paths.tcs}
                          target="_blank"
                          style={{ textDecoration: "none" }}
                        >
                          <Typography color="primary">
                            terms and conditions
                          </Typography>
                        </Link>
                      </Box>
                    }
                  />
                  {errors.terms ? (
                    <FormHelperText error>
                      {errors.terms.message}
                    </FormHelperText>
                  ) : null}
                </div>
              );
            }}
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

export default TCsForm;
