// src/components/dashboard/quotations/quotation-drafts-api.ts

import { ActionResponse } from "@/types/actions-response.types";
import { NewQuotation } from "@/types/quotations.types";
import { baseUrl } from "@/utils/url.utils";

export const fetchQuotationDraftsHandler = async (
  userId: number
): Promise<NewQuotation[]> => {
  try {
    const uri = baseUrl + "/api/quotations/drafts";

    const res = await fetch(uri, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    });

    if (res.status !== 200) {
      console.log("Failed to fetch quotation drafts");
      return [];
    }

    const body = (await res.json()) as ActionResponse<NewQuotation[]>;

    if (!body.data) {
      return [];
    }

    return body.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const recordQuotationDraftHandler = async (
  draft: NewQuotation,
  userId: number
): Promise<boolean> => {
  try {
    const uri = baseUrl + "/api/quotations/drafts";

    const res = await fetch(uri, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, quotationDraft: draft }),
    });

    if (res.status !== 200) {
      console.log("Failed to record quotation draft");
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

export const deleteSingleQuotationDraftHandler = async (
  draftId: number,
  userId: number
): Promise<boolean> => {
  try {
    const uri = baseUrl + `/api/quotations/drafts/${draftId}`;

    const res = await fetch(uri, {
      method: "DELETE",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, quotationDraftId: draftId }),
    });

    if (res.status !== 200) {
      console.log("Failed to delete quotation draft");
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

export const deleteAllQuotationDraftsHandler = async (
  userId: number
): Promise<boolean> => {
  try {
    const uri = baseUrl + "/api/quotations/drafts";

    const res = await fetch(uri, {
      method: "DELETE",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    });

    if (res.status !== 200) {
      console.log("Failed to delete quotation drafts");
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};
