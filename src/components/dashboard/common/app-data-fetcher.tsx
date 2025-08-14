"use client";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { fetchQuotationDraftsHandler } from "../quotations/quotation-drafts-api";
import { NewQuotation } from "@/types/quotations.types";
import { useAppDispatch } from "@/redux/store";
import { setQuotationDrafts } from "@/redux/slices/quotation.slice";

const AppDataFetcher = () => {
  const { data: sessionData } = useSession();
  const dispatch = useAppDispatch();

  const fetchQuotationDrafts = async (userId: number) => {
    const drafts: NewQuotation[] = await fetchQuotationDraftsHandler(userId);
    dispatch(setQuotationDrafts(drafts));
  };

  useEffect(() => {
    if (!sessionData) return;

    const { user } = sessionData;

    fetchQuotationDrafts(user.userId);
  }, [sessionData]);

  return <></>;
};

export default AppDataFetcher;
