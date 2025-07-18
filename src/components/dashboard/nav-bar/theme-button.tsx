"use client";

import { setThemeMode } from "@/redux/slices/theme.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { IconButton, Tooltip } from "@mui/material";
import { MoonStars, SunDim } from "@phosphor-icons/react/dist/ssr";
import React from "react";

const ThemeButton = () => {
  const { mode } = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();
  return (
    <Tooltip title={mode == "dark" ? "Light Theme" : "Dark Theme"}>
      <IconButton
        size="medium"
        onClick={() => {
          mode == "dark"
            ? dispatch(setThemeMode("light"))
            : dispatch(setThemeMode("dark"));
        }}
      >
        {mode == "light" ? <MoonStars /> : <SunDim />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeButton;
