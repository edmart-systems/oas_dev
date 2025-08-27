import { ActionResponse } from "@/types/actions-response.types";
import { NewQuotation } from "@/types/quotations.types";


export const saveAutoDraftHandler = async (
  draft: NewQuotation,
  userId: number
): Promise<boolean> => {
  try {
    console.log('Calling auto-draft API for user:', userId);
    const uri = "/api/quotations/auto-draft";

    const res = await fetch(uri, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, quotationDraft: draft }),
    });

    console.log('Auto-draft API response status:', res.status);
    
    if (res.status !== 200) {
      const errorText = await res.text();
      console.log("Failed to save auto-draft:", errorText);
      return false;
    }

    const responseData = await res.json();
    console.log('Auto-draft API response:', responseData);
    return true;
  } catch (err) {
    console.log("Auto-draft save error:", err);
    return false;
  }
};

export const getLatestAutoDraftHandler = async (
  userId: number
): Promise<{ draft: NewQuotation; timestamp: Date } | null> => {
  try {
    const uri = `/api/quotations/auto-draft?userId=${userId}`;

    const res = await fetch(uri, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.status !== 200) {
      console.log("Failed to fetch auto-draft");
      return null;
    }

    const body = (await res.json()) as ActionResponse<{ draft: NewQuotation; timestamp: Date } | null>;

    return body.data || null;
  } catch (err) {
    console.log("Auto-draft fetch error:", err);
    return null;
  }
};

export const deleteAutoDraftHandler = async (
  userId: number
): Promise<boolean> => {
  try {
    const uri = "/api/quotations/auto-draft";

    const res = await fetch(uri, {
      method: "DELETE",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    });

    if (res.status !== 200) {
      console.log("Failed to delete auto-draft");
      return false;
    }

    return true;
  } catch (err) {
    console.log("Auto-draft delete error:", err);
    return false;
  }
};