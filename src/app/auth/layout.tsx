"use client";

import { paths } from "@/utils/paths.utils";
import RouterLink from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import React, { ReactNode, useEffect, useState } from "react";
import { DynamicLogo } from "@/components/core/logo";
import GuestGuard from "@/components/auth/guest-guard";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/store";

const AuthLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  const { mode } = useAppSelector((state) => state.theme);
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsRegister(pathname.includes("reg"));
  }, [pathname]);

  return (
    <GuestGuard>
      <Box
        sx={{
          display: { xs: "flex", lg: "grid" },
          flexDirection: "column",
          gridTemplateColumns: isRegister ? "1.2fr 1.1fr" : "1.3fr 1fr",
          minHeight: "100%",
          transition: "0.2s all linear",
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            background: mode == "dark" ? "#1a1b1c" : "#f9fafb",
            color: `var(--mui-palette-common-${
              mode == "dark" ? "white" : "black"
            })`,
            display: { xs: "none", lg: "flex" },
            justifyContent: "center",
            p: 3,
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography
                color="inherit"
                sx={{
                  fontSize: "24px",
                  lineHeight: "32px",
                  textAlign: "center",
                }}
                variant="h1"
              >
                Welcome to{" "}
                <Box component="span" sx={{ color: "#D98219" }}>
                  Edmart Systems Office Automation
                </Box>
              </Typography>
              <Typography align="center" variant="subtitle1">
                Your all-in-one solution for efficient and streamlined office
                operations.
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                alt="Widgets"
                src="/assets/office.png"
                sx={{
                  height: "auto",
                  width: "100%",
                  maxWidth: "600px",
                }}
              />
            </Box>
          </Stack>
        </Box>
        <Box
          sx={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            // background: "#fff",
            boxShadow: `2px 0px 12px 0px ${
              mode == "dark" ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)"
            }`,
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box
              component={RouterLink}
              href={paths.home}
              sx={{ display: "inline-block", fontSize: 0 }}
            >
              <DynamicLogo
                colorDark="light"
                colorLight="dark"
                height={60}
                width={200}
              />
            </Box>
          </Box>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flex: "1 1 auto",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Box
              sx={{ maxWidth: isRegister ? "750px" : "450px", width: "100%" }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </GuestGuard>
  );
};

export default AuthLayout;
