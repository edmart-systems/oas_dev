import { Components, Theme } from "@mui/material";

export const MuiButton = {
  styleOverrides: {
    root: { borderRadius: "6px", textTransform: "none" },
  },
} satisfies Components<Theme>["MuiButton"];
