import { replace } from "lodash";
import numeral from "numeral";

export const fCurrency = (num: number): string => {
  return numeral(num).format(Number.isInteger(num) ? "$0,0" : "$0,0.00");
};

export const fPercent = (num: number): string => {
  return numeral(num / 100).format("0.0%");
};

export const fNumber = (num: number): string => {
  return numeral(num).format();
};

export const fShortenNumber = (num: number): string => {
  return replace(numeral(num).format("0.00a"), ".00", "");
};

export const fData = (num: number): string => {
  return numeral(num).format("0.0 b");
};
