"use client";

import React, { useContext } from "react";
import { ToastContainer } from "react-toastify";
import { useAppSelector } from "@/redux/store";

const ToastProvider = () => {
  const { mode } = useAppSelector((state) => state.theme);

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3500}
      theme={mode ?? "light"}
    />
  );
};

export default ToastProvider;
