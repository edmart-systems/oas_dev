import { QuotationFilters } from "@/types/quotations.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QuotationSearchState {
  params: QuotationFilters | null;
  isSearching: boolean;
}

const initialState: QuotationSearchState = {
  params: null,
  isSearching: false,
};

const quotationSearchSlice = createSlice({
  name: "quotationSearch",
  initialState: initialState,
  reducers: {
    updateQuotationSearchParams: (
      state,
      action: PayloadAction<QuotationFilters>
    ) => {
      state.params = action.payload;
    },
    clearQuotationSearchParams: (state) => {
      state.params = null;
      state.isSearching = false;
    },
    setSearchingQuotation: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
  },
});

export const {
  updateQuotationSearchParams,
  clearQuotationSearchParams,
  setSearchingQuotation,
} = quotationSearchSlice.actions;
export const quotationSearchReducer = quotationSearchSlice.reducer;
