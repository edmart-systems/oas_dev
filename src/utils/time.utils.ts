import { ItemRange } from "@/types/other.types";
import { format, formatDistanceToNow, formatDistance, subDays } from "date-fns";

type FormatDateParam = number | string | Date;

export const fDateDdMmmYyyy = (date: FormatDateParam): string => {
  try {
    return format(new Date(date), "dd MMM, yyyy");
  } catch (err) {
    console.log(err);
    return "Invalid";
  }
};

export const fDateWwwDdMmmYyyy = (date: FormatDateParam): string => {
  try {
    return format(new Date(date), "eee dd MMM, yyyy");
  } catch (err) {
    console.log(err);
    return "Invalid";
  }
};

export const fDateTime24 = (date: FormatDateParam): string => {
  try {
    return format(new Date(date), "dd MMM, yyyy HH:mm");
  } catch (err) {
    console.log(err);
    return "Invalid";
  }
};

export const fDateTime12 = (date: FormatDateParam): string => {
  try {
    return format(new Date(date), "dd MMM, yyyy p");
  } catch (err) {
    console.log(err);
    return "Invalid";
  }
};

export const fDateTimeSuffix = (date: FormatDateParam): string => {
  try {
    return format(new Date(date), "dd/MM/yyyy hh:mm p");
  } catch (err) {
    console.log(err);
    return "Invalid";
  }
};

export const fDateTimeSuffix2 = (date: FormatDateParam): string => {
  try {
    return format(new Date(date), "dd/MM/yyyy p");
  } catch (err) {
    console.log(err);
    return "Invalid";
  }
};

export const fToNow = (date: FormatDateParam): string => {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
    });
  } catch (err) {
    console.log(err);
    return "Invalid";
  }
};

export const getTimeNum = (date?: FormatDateParam): number => {
  try {
    return date ? new Date(date).getTime() : new Date().getTime();
  } catch (err) {
    console.log(err);
    return -1;
  }
};

export const isDateExpired = (date: FormatDateParam): boolean => {
  try {
    const now = new Date().getTime();
    const expiry = new Date(date).getTime();
    return expiry < now;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const getDateStrYyMmDd = (date?: FormatDateParam): string => {
  try {
    const dt = date ? new Date(date) : new Date();
    const mm = dt.getMonth() + 1;
    const dd = dt.getDate();
    const yy = dt.getFullYear();

    return `${yy}-${mm}-${dd}`;
  } catch (err) {
    console.log(err);
    return "Invalid";
  }
};

export const getMonthTimeRange = (date?: FormatDateParam): ItemRange => {
  const dt = date ? new Date(date) : new Date();

  return {
    min: new Date(dt.getFullYear(), dt.getMonth(), 1).getTime(),
    max: new Date(
      dt.getFullYear(),
      dt.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ).getTime(),
  };
};

export const getDaysInMonth = (date?: FormatDateParam): number => {
  const dt = date ? new Date(date) : new Date();
  return new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
};
