import { ItemRange } from "@/types/other.types";
import { QuotationId } from "@/types/quotations.types";

export const codeGenerator = (length: number) => {
  try {
    const x = parseInt(`9`.repeat(length), 10);
    const y = parseInt(`1${"0".repeat(length - 1)}`, 10);
    return Math.floor(Math.random() * (x - y + 1)) + y;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const checkDigitsOnly = (numberStr: string): boolean => {
  try {
    let startIndex = 0;

    if (numberStr[0] === "+" || numberStr[0] === "-") {
      if (numberStr.length === 1) {
        return false;
      }
      startIndex = 1;
    }

    for (let i = startIndex; i < numberStr.length; i++) {
      const char = numberStr[i];
      if (char < "0" || char > "9") {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const checkFloatDigits = (numberStr: string): boolean => {
  try {
    const numArr = numberStr.split(".");

    if (numArr.length > 2) {
      return false;
    }

    return checkDigitsOnly(numberStr.replace(".", ""));
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const validatePhoneNumber = (phoneNumber: string) => {
  const validRegex =
    /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
  if (phoneNumber.slice(0, 1) !== "+") {
    return false;
  }
  if (phoneNumber.match(validRegex)) {
    return true;
  }
  return false;
};

export const validateEmailAddress = (email: string) => {
  const validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (email.match(validRegex)) {
    return true;
  }
  return false;
};

export const validatePassword = (password: string) => {
  const validRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (password.match(validRegex)) {
    return true;
  }
  return false;
};

export const validateUserName = (
  name1?: string,
  name2?: string,
  name3?: string
) => {
  if (!name1 || !name2 || name1.length < 3 || name2.length < 3) {
    return false;
  }
  return true;
};

export const validateCompanyId = (id: string): boolean => {
  try {
    if (id.length !== 11) {
      return false;
    }

    const firstPart = id.substring(0, 4);
    const secondPart = id.substring(4, 8);
    const thirdPart = id.substring(8);

    if (firstPart !== "TEMP" && firstPart !== "ESUL") {
      return false;
    }

    if (secondPart.length !== 4 || !checkDigitsOnly(secondPart)) {
      return false;
    }

    if (thirdPart.length !== 3 || !checkDigitsOnly(thirdPart)) {
      return false;
    }

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const validateQuotationId = (quotationId: string): boolean => {
  if (!quotationId.startsWith("Q")) {
    return false;
  }

  if (quotationId.length !== 10 && quotationId.length !== 11) {
    return false;
  }

  const numericPart = quotationId.slice(1);

  try {
    if (Number.isNaN(parseInt(numericPart, 10))) {
      return false;
    }
  } catch (err) {
    return false;
  }

  return true;
};

export const validateQuotationIdObject = (
  quotationIdObj: QuotationId
): boolean => {
  const { quotationId, quotationNumber } = quotationIdObj;

  if (Number.isNaN(quotationId)) {
    return false;
  }

  return validateQuotationId(quotationNumber);
};

export const isWithinRange = (value: number, range: ItemRange): boolean => {
  return value >= range.min && value <= range.max;
};
