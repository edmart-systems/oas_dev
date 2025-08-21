import { QuotationFilters } from "@/types/quotations.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QuotationTableState {
  page: number;
  offset: number;
  filters: QuotationFilters | null;
  scrollPosition: number;
  inSearchMode: boolean;
  searchPage: number;
  searchOffset: number;
  viewMode: string | null; // 'group' or null
  expandedQuotations: string[]; // Array of expanded quotation IDs
}

const initialState: QuotationTableState = {
  page: 0,
  offset: 0,
  filters: null,
  scrollPosition: 0,
  inSearchMode: false,
  searchPage: 0,
  searchOffset: 0,
  viewMode: null,
  expandedQuotations: [],
};

const quotationTableStateSlice = createSlice({
  name: "quotationTableState",
  initialState: initialState,
  reducers: {
    setTablePage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setTableOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
    setTableFilters: (state, action: PayloadAction<QuotationFilters | null>) => {
      state.filters = action.payload;
    },
    setScrollPosition: (state, action: PayloadAction<number>) => {
      state.scrollPosition = action.payload;
    },
    setSearchMode: (state, action: PayloadAction<boolean>) => {
      state.inSearchMode = action.payload;
    },
    setSearchPage: (state, action: PayloadAction<number>) => {
      state.searchPage = action.payload;
    },
    setSearchOffset: (state, action: PayloadAction<number>) => {
      state.searchOffset = action.payload;
    },
    setViewMode: (state, action: PayloadAction<string | null>) => {
      state.viewMode = action.payload;
    },
    setExpandedQuotations: (state, action: PayloadAction<string[]>) => {
      state.expandedQuotations = action.payload;
    },
    toggleQuotationExpanded: (state, action: PayloadAction<string>) => {
      const quotationId = action.payload;
      const index = state.expandedQuotations.indexOf(quotationId);
      if (index > -1) {
        state.expandedQuotations.splice(index, 1);
      } else {
        state.expandedQuotations.push(quotationId);
      }
    },
    resetTableState: (state) => {
      state.page = 0;
      state.offset = 0;
      state.filters = null;
      state.scrollPosition = 0;
      state.inSearchMode = false;
      state.searchPage = 0;
      state.searchOffset = 0;
      state.viewMode = null;
      state.expandedQuotations = [];
    },
  },
});

export const {
  setTablePage,
  setTableOffset,
  setTableFilters,
  setScrollPosition,
  setSearchMode,
  setSearchPage,
  setSearchOffset,
  setViewMode,
  setExpandedQuotations,
  toggleQuotationExpanded,
  resetTableState,
} = quotationTableStateSlice.actions;
export const quotationTableStateReducer = quotationTableStateSlice.reducer;