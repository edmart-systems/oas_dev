import { Currency2 } from "@/types/currency.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CurrenciesState {
  currencies: Currency2[] | null;
}

const initialState: CurrenciesState = {
  currencies: null,
};

const currenciesSlice = createSlice({
  name: "units",
  initialState: initialState,
  reducers: {
    setCurrencies: (state, action: PayloadAction<Currency2[]>) => {
      state.currencies = action.payload;
    },
  },
});

export const { setCurrencies } = currenciesSlice.actions;
export const currenciesReducer = currenciesSlice.reducer;
