"use client";

import { signOut } from "next-auth/react";

export const mSignOut = async (): Promise<void> => {
  try {
    alert("Heere");
    await signOut();
    Promise.resolve();
  } catch (err) {
    console.log("Sign out 1", err);
    try {
      await signOut();
      Promise.resolve();
    } catch (err) {
      console.log("Sign out 2", err);
      window.location.reload();
      //TODO: Create manual sign out clearing all cookies and session storage
      Promise.resolve();
    }
  }
};
