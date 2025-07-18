import { MAXIMUM_UI_INACTIVITY_MINUTES } from "@/utils/constants.utils";
import { minutesToMilliseconds } from "@/utils/time-converters.utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ActivityState {
  exp: number;
}

const initialState: ActivityState = {
  exp:
    new Date().getTime() + minutesToMilliseconds(MAXIMUM_UI_INACTIVITY_MINUTES),
};

const activitySlice = createSlice({
  name: "activity",
  initialState: initialState,
  reducers: {
    updateActivityExp: (state) => {
      state.exp =
        new Date().getTime() +
        minutesToMilliseconds(MAXIMUM_UI_INACTIVITY_MINUTES);
    },
  },
});

export const { updateActivityExp } = activitySlice.actions;
export const activityReducer = activitySlice.reducer;
