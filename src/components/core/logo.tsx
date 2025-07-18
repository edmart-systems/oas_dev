"use client";

import React from "react";
import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";

import { NoSsr } from "@/components/core/no-ssr";

const HEIGHT = 60;
const WIDTH = 60;

type Color = "dark" | "light";

export interface LogoProps {
  color?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export const Logo = ({
  color = "dark",
  emblem,
  height = HEIGHT,
  width = WIDTH,
}: LogoProps): JSX.Element => {
  let url: string;

  if (emblem) {
    url =
      color === "light"
        ? "/assets/edmrt-01-300x88.png"
        : "/assets/edmrt-01-300x88.png";
  } else {
    url =
      color === "light"
        ? "/assets/edmrt-01-300x88.png"
        : "/assets/edmrt-01-300x88.png";
  }

  return (
    <Box alt="logo" component="img" height={height} src={url} width={width} />
  );
};

export interface DynamicLogoProps {
  colorDark?: Color;
  colorLight?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export const DynamicLogo = ({
  colorDark = "light",
  colorLight = "dark",
  height = HEIGHT,
  width = WIDTH,
  ...props
}: DynamicLogoProps): JSX.Element => {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === "dark" ? colorDark : colorLight;

  return (
    <NoSsr
      fallback={<Box sx={{ height: `${height}px`, width: `${width}px` }} />}
    >
      <Logo color={color} height={height} width={width} {...props} />
    </NoSsr>
  );
};
