import { Components, Theme } from "@mui/material";

export const MuiMenuItem = {
  styleOverrides: {
    root: { margin: "3px 5px", borderRadius: "8px" },
  },
} satisfies Components<Theme>["MuiMenuItem"];
