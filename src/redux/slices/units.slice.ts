import { Unit2 } from "@/types/quotations.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UnitsState {
  units: Unit2[];
}

const initialState: UnitsState = {
  units: [],
};

const unitsSlice = createSlice({
  name: "units",
  initialState: initialState,
  reducers: {
    setUnits: (state, action: PayloadAction<Unit2[]>) => {
      state.units = action.payload;
    },
  },
});

export const { setUnits } = unitsSlice.actions;
export const unitsReducer = unitsSlice.reducer;
