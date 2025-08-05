import {
  QuotationClientData,
  QuotationError,
  QuotationInputClientData,
  QuotationInputLineItem,
  QuotationPriceSummary,
  TcsDto,
} from "@/types/quotations.types";
import {
  MAX_LINE_ITEM_DESCRIPTION_LENGTH,
  quotationDeliveryDaysRange,
  quotationGraceDaysRange,
  quotationValidityRange,
} from "@/utils/constants.utils";
import {
  capitalizeFirstLetter,
  formatPhoneNumber,
} from "@/utils/formatters.util";
import {
  checkDigitsOnly,
  checkFloatDigits,
  isWithinRange,
  validateEmailAddress,
  validatePhoneNumber,
} from "@/utils/verification-validation.utils";
import { Quotation_type } from "@prisma/client";

export const verifyTcs = ({
  selectedTcs,
  quotationType,
  editTcs,
}: {
  selectedTcs: TcsDto;
  quotationType: Quotation_type;
  editTcs: boolean;
}): boolean | QuotationError[] => {
  if (!editTcs) {
    return true;
  }

  const errArr: QuotationError[] = [];

  const {
    edited_validity_days,
    edited_payment_grace_days,
    edited_initial_payment_percentage,
    edited_last_payment_percentage,
    edited_delivery_days,
  } = selectedTcs;

  if (
    !edited_validity_days ||
    !isWithinRange(edited_validity_days, quotationValidityRange)
  ) {
    errArr.push({
      message: `Validity out of range ${quotationValidityRange.min}-${quotationValidityRange.max} days`,
      origin: "TCs",
    });
  }

  if (
    !edited_delivery_days ||
    !isWithinRange(edited_delivery_days, quotationDeliveryDaysRange)
  ) {
    errArr.push({
      message: `Delivery days out of range ${quotationDeliveryDaysRange.min}-${quotationDeliveryDaysRange.max} days`,
      origin: "TCs",
    });
  }

  if (quotationType.type_id == 1) {

    const hasValue =
      edited_payment_grace_days !== undefined &&
      edited_payment_grace_days !== null &&
      !Number.isNaN(edited_payment_grace_days);

    if (
      !hasValue ||
      !isWithinRange(edited_payment_grace_days, quotationGraceDaysRange)
    ) {
      errArr.push({
        message: `Grace period must be between ${quotationGraceDaysRange.min} and ${quotationGraceDaysRange.max} days (negative=before delivery, 0=on delivery, positive=after delivery).`,
        origin: "TCs",
      });
    }
  } else {
    if (
      !edited_initial_payment_percentage ||
      !edited_last_payment_percentage ||
      edited_initial_payment_percentage + edited_last_payment_percentage !== 100
    ) {
      errArr.push({
        message: `Payment percentages not tallying.`,
        origin: "TCs",
      });
    }
  }

  return errArr.length > 0 ? errArr : true;
};

export const verifyClientInfo = (
  clientData: QuotationInputClientData
): boolean | QuotationError[] => {
  const errArr: QuotationError[] = [];
  let atLeastNameOrContactPerson = false;

  Object.keys(clientData).forEach((_key) => {
    const key = _key as keyof QuotationClientData;
    const value = clientData[key];
    try {
      if (
        (key === "name" && value && String(value).length > 2) ||
        (key === "contactPerson" && value && String(value).length > 2)
      ) {
        atLeastNameOrContactPerson = true;
      }

      if (String(value).length > 64) {
        errArr.push({
          message: `${capitalizeFirstLetter(
            key
          )} field is too long. Reduce to a max of 64 Characters`,
          origin: "Client Info",
        });
      }

      if (
        key == "email" &&
        value &&
        !validateEmailAddress(String(value ?? "").trim())
      ) {
        errArr.push({
          message: `Invalid email address. Correct or remove it.`,
          origin: "Client Info",
        });
      }

      if (key == "phone" && value) {
        try {
          const formattedPhone = formatPhoneNumber(String(value));
          if (!validatePhoneNumber(formattedPhone)) {
            errArr.push({
              message: `Invalid phone number. Correct or remove it.`,
              origin: "Client Info",
            });
          }
        } catch (err) {
          errArr.push({
            message: `Invalid phone number. Correct or remove it.`,
            origin: "Client Info",
          });
        }
      }
    } catch (err) {
      console.log(err);
      errArr.push({
        message: `Invalid inputs on field ${capitalizeFirstLetter(key)}`,
        origin: "Client Info",
      });
    }
  });

  if (!atLeastNameOrContactPerson) {
    errArr.push({
      message: `At least the client name or contact person must be provided, with at least 3 characters.`,
      origin: "Client Info",
    });
  }

  return errArr.length > 0 ? errArr : true;
};

export const verifyLineItems = (
  lineItems: QuotationInputLineItem[]
): boolean | QuotationError[] => {
  const errArr: QuotationError[] = [];

  if (lineItems.length < 1) {
    errArr.push({
      message: `No items provided.`,
      origin: "Line Items",
    });
  }

  lineItems.forEach((item, index) => {
    const missing: string[] = [];
    const tooShort: string[] = [];
    const tooLong: string[] = [];
    const invalid: string[] = [];

    Object.keys(item).forEach((_key) => {
      const key = _key as keyof QuotationInputLineItem;
      const value = item[key];

      if (key !== "description") {
        if (!value) {
          missing.push(capitalizeFirstLetter(key));
        }

        if (String(value).length > 30) {
          tooLong.push(capitalizeFirstLetter(key));
        }

        if (key == "quantity" || key == "unitPrice") {
          if (!checkFloatDigits(String(value))) {
            invalid.push(capitalizeFirstLetter(key));
          }
        }

        if (key === "units") {
          if (String(value).trim().length <= 1) {
            tooShort.push(capitalizeFirstLetter(key));
          }
        }
      }

      if (key == "description") {
        if (value) {
          // if (String(value).trim().length > MAX_LINE_ITEM_DESCRIPTION_LENGTH) {
          //   tooLong.push(capitalizeFirstLetter(key));
          // }
        }
      }
    });

    let errorMessage = `Line item ${index + 1}:`;

    if (missing.length > 0) {
      errorMessage += ` ${missing.join(", ")} field(s) missing.`;
    }

    if (tooShort.length > 0) {
      errorMessage += ` ${tooShort.join(", ")} field(s) too short.`;
    }

    if (tooLong.length > 0) {
      errorMessage += ` ${tooLong.join(", ")} field(s) too long.`;
    }

    if (invalid.length > 0) {
      errorMessage += ` ${invalid.join(", ")} field(s) invalid.`;
    }

    if (
      missing.length > 0 ||
      tooLong.length > 0 ||
      invalid.length > 0 ||
      tooShort.length > 0
    ) {
      errorMessage += " Correct or remove item.";
      errArr.push({
        message: errorMessage,
        origin: "Line Items",
      });
    }
  });

  return errArr.length > 0 ? errArr : true;
};

export const verifyClientInfoOnDraft = (
  clientData: QuotationInputClientData
): boolean | QuotationError[] => {
  const errArr: QuotationError[] = [];
  let atLeastNameOrContactPerson = false;

  Object.keys(clientData).forEach((_key) => {
    const key = _key as keyof QuotationClientData;
    const value = clientData[key];
    try {
      if (
        (key === "name" && value && String(value).length > 2) ||
        (key === "contactPerson" && value && String(value).length > 2)
      ) {
        atLeastNameOrContactPerson = true;
      }
    } catch (err) {
      console.log(err);
      errArr.push({
        message: `Invalid inputs on field ${capitalizeFirstLetter(key)}`,
        origin: "Client Info",
      });
    }
  });

  if (!atLeastNameOrContactPerson) {
    errArr.push({
      message: `At least the client name or contact person must be provided, with at least 3 characters.`,
      origin: "Client Info",
    });
  }

  return errArr.length > 0 ? errArr : true;
};

export const calculateQuotationPricesSummary = ({
  lineItems,
  excludeVat,
  selectedTcs,
}: {
  lineItems: QuotationInputLineItem[];
  excludeVat: boolean;
  selectedTcs: TcsDto;
}): QuotationPriceSummary => {
  let subtotal = 0;
  for (const item of lineItems) {
    if (!item.quantity || !item.unitPrice) continue;
    subtotal += item.quantity * item.unitPrice;
  }

  const vat = excludeVat ? 0 : (subtotal * selectedTcs.vat_percentage) / 100;
  const finalTotal = subtotal + vat;
  const roundedUpTotal = Math.ceil(finalTotal);
  return { subtotal: subtotal, vat: vat, finalTotal: roundedUpTotal };
};
