export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) {
    throw new Error("Formatter: Invalid Phone Number");
  }

  const num = `${phoneNumber.trim()}`.replace(/ /g, "").replace(/\+/g, "");
  const length = num.length;

  if (length === 9) {
    return `+256${num}`;
  }
  if (length === 10 && num.substring(0, 1) === "0") {
    return num.replace(/0/, "+256");
  }
  if (num.substring(0, 3) === "256" && length === 12) {
    return `+${num}`;
  }
  throw new Error("Formatter: Invalid Phone Number");
};

export const formatDisplayedPhoneNumber = (phone: string): string => {
  return phone.replace(/(\+\d{3})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3$4");
};

export const capitalizeFirstLetter = (str: string) => {
  return str[0].toUpperCase() + str.substring(1);
};

export const userNameFormatter = (
  name1: string,
  name2: string,
  name3?: string | null
): string =>
  [name1.trim(), name2.trim(), name3?.trim()].filter(Boolean).join(" ");

export const userNameFormatterSummary = (
  name1: string,
  name2: string,
  name3?: string | null
): string => {
  return `${name1.trim()} ${name2.trim().substring(0, 1).toUpperCase()}.`;
};
