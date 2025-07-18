import { Theme } from "@mui/material";

export const sxFlexRowSpaceBtn = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

export const hoverBackground = (theme: Theme): string =>
  theme.palette.mode === "dark"
    ? theme.palette.grey[800]
    : theme.palette.grey[200];
