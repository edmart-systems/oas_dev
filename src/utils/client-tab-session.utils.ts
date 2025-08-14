"use client";

export const storeTabSessionValue = (key: string, value: string): boolean => {
  try {
    sessionStorage[key] = value;
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const getTabSessionValue = (key: string): string | null => {
  try {
    return String(sessionStorage[key]);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const deleteTabSessionValue = (key: string): boolean => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const clearTabSessionValues = (): boolean => {
  try {
    sessionStorage.clear();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
