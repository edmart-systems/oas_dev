"use client";

import MyCircularProgress from "@/components/common/my-circular-progress";
import { useAppSelector } from "@/redux/store";
import React, { Fragment } from "react";

const QuotationsFetchingProgress = () => {
  const { isSearching } = useAppSelector((state) => state.quotationSearch);
  return <Fragment>{isSearching && <MyCircularProgress />}</Fragment>;
};

export default QuotationsFetchingProgress;
