"use client";

import { createTheme } from "@/styles/theme/create-theme";
import { ColorScheme } from "@/styles/theme/types";
import { Theme, ThemeProvider, useMediaQuery } from "@mui/material";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  useEffect,
  useState,
} from "react";

export type ThemeContextData = {
  mode: ColorScheme;
  setMode: Dispatch<React.SetStateAction<ColorScheme>>;
  theme: Theme;
};

const initialTheme: ThemeContextData = {
  mode: "light",
  theme: createTheme("light"),
  setMode: () => {},
};

export const ThemeContext = createContext(initialTheme);

type Props = {
  children: ReactNode;
};

const ThemeContextProvider = ({ children }: Props) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<ColorScheme>(
    prefersDarkMode ? "dark" : "light"
  );

  useEffect(() => {
    setMode(prefersDarkMode ? "dark" : "light");
  }, [prefersDarkMode]);

  const theme = createTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
