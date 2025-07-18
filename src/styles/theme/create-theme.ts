import { createTheme as _createTheme } from "@mui/material";
import { ColorScheme } from "./types";
import { components } from "./components";

export const createTheme = (mode: ColorScheme) =>
  _createTheme({
    // cssVariables: { cssVarPrefix: "" },
    components,
    cssVariables: true,
    palette: {
      mode: mode == "dark" ? "dark" : "light",
      primary: {
        main: "#D98219",
        contrastText: "#fff",
      },
      secondary: {
        main: "#42A5F5",
        contrastText: "#fff",
      },
    },
  });
