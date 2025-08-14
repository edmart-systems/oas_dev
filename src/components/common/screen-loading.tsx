"use client";

import { JSX } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

type Props = {
  fullScreen?: boolean;
};

const ScreenLoader = ({ fullScreen }: Props): JSX.Element => {
  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        // minHeight: "100%",
        height: fullScreen ? "100vh" : "100%",
        width: fullScreen ? "100vw" : "100%",
      }}
    >
      <Stack spacing={3} sx={{ alignItems: "center", maxWidth: "md" }}>
        <Box>
          <Box
            component="img"
            alt="Loading"
            src="/assets/Animation.gif"
            sx={{
              display: "inline-block",
              height: "auto",
              maxWidth: "100%",
              width: "auto",
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default ScreenLoader;
