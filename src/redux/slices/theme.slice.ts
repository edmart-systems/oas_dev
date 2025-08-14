import { ColorScheme } from "@/styles/theme/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ThemeState {
  mode: ColorScheme | null;
}

const initialState: ThemeState = {
  mode: null,
};

const themeSlice = createSlice({
  name: "theme",
  initialState: initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ColorScheme>) => {
      const newMode = action.payload as ColorScheme;
      state.mode = newMode;
    },
    resetTheme: (state) => {
      state.mode = null;
    },
  },
});

export const { setThemeMode, resetTheme } = themeSlice.actions;

export const themeReducer = themeSlice.reducer;
