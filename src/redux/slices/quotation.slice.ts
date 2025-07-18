import {
  deleteAllQuotationDraftsHandler,
  deleteSingleQuotationDraftHandler,
  recordQuotationDraftHandler,
} from "@/components/dashboard/quotations/quotation-drafts-api";
import { NewQuotation, QuotationDraftSummary } from "@/types/quotations.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QuotationState {
  quotations: NewQuotation[];
  summary: QuotationDraftSummary[];
  reuse: NewQuotation | null;
}

const initialState: QuotationState = {
  quotations: [],
  summary: [],
  reuse: null,
};

const createSummary = (draft: NewQuotation): QuotationDraftSummary => {
  const { quotationId, clientData } = draft;
  const clientName = clientData.name;
  const contactPerson = clientData.contactPerson;

  return {
    name: (clientName
      ? `${clientName}${contactPerson ? ` (${contactPerson})` : ""}`
      : contactPerson || "Unknown"
    ).substring(0, 24),
    quotationId,
  };
};

const quotationsSlice = createSlice({
  name: "quotations",
  initialState: initialState,
  reducers: {
    setQuotationDrafts: (state, action: PayloadAction<NewQuotation[]>) => {
      const summaries: QuotationDraftSummary[] = [];
      for (const draft of action.payload) {
        summaries.push(createSummary(draft));
      }
      state.quotations = action.payload;
      state.summary = summaries;
    },
    saveQuotationDraft: (
      state,
      action: PayloadAction<{
        userId: number;
        quotationDraft: NewQuotation;
      }>
    ) => {
      if (state.summary.length >= 5) return;

      const { userId, quotationDraft: draft } = action.payload;

      const { quotationId } = draft;

      const existingIndex = state.summary.findIndex(
        (item) => item.quotationId === quotationId
      );

      const summary = createSummary(draft);

      if (existingIndex >= 0) {
        state.quotations[existingIndex] = draft;
        state.summary[existingIndex] = summary;
        recordQuotationDraftHandler(draft, userId);
        return;
      }

      state.quotations.push(draft);
      state.summary.push(summary);
      recordQuotationDraftHandler(draft, userId);
      return;
    },
    removeQuotationDraft: (
      state,
      action: PayloadAction<{ draftId: number; userId: number }>
    ) => {
      const { draftId, userId } = action.payload;
      state.quotations = state.quotations.filter(
        (item) => item.quotationId !== draftId
      );
      state.summary = state.summary.filter(
        (item) => item.quotationId !== draftId
      );
      deleteSingleQuotationDraftHandler(draftId, userId);
      return;
    },
    deleteAllQuotationDrafts: (
      state,
      action: PayloadAction<{ userId: number }>
    ) => {
      state.quotations = [];
      state.summary = [];
      deleteAllQuotationDraftsHandler(action.payload.userId);
      return;
    },
    clearLocalQuotationDrafts: (state) => {
      state.quotations = [];
      state.summary = [];
      return;
    },
    setReuseQuotations: (state, action: PayloadAction<NewQuotation>) => {
      state.reuse = action.payload;
    },
    clearReuseQuotations: (state) => {
      state.reuse = null;
    },
  },
});

export const {
  setQuotationDrafts,
  saveQuotationDraft,
  deleteAllQuotationDrafts,
  removeQuotationDraft,
  clearLocalQuotationDrafts,
  setReuseQuotations,
  clearReuseQuotations,
} = quotationsSlice.actions;
export const quotationsReducer = quotationsSlice.reducer;
