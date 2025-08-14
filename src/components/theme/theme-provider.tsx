"use client";

import React, { useEffect, useState } from "react";
import {
  ThemeProvider as MUIThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { createTheme } from "@/styles/theme/create-theme";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setThemeMode } from "@/redux/slices/theme.slice";
import ScreenLoader from "../common/screen-loading";
import nProgress from "nprogress";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { checkSessionExpiration } from "../auth/session-monitor";

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({
  children,
}: ThemeProviderProps): React.JSX.Element => {
  const { mode } = useAppSelector((state) => state.theme);
  const { data: sessionData } = useSession();
  const dispatch = useAppDispatch();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [hasMounted, setHasMounted] = useState(false);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    nProgress.done();
    if (hasMounted && mode == null) {
      dispatch(setThemeMode(prefersDarkMode ? "dark" : "light"));
    }

    if (hasMounted) {
      checkSessionExpiration(pathName, sessionData, dispatch);
    }
  }, [mode, pathName, searchParams, prefersDarkMode, hasMounted]);

  if (!hasMounted || !mode) {
    return <ScreenLoader fullScreen />;
  }

  const theme = createTheme(mode);

  return <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>;
};
