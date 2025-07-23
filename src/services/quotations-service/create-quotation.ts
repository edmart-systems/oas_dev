import { logger } from "@/logger/default-logger";
import { ObjectVerifyResponse } from "@/types/other.types";
import {
  QuotationClientData,
  QuotationInputClientData,
  QuotationInputLineItem,
  QuotationPriceSummary,
  RawQuotationLineItem,
  TcsDto,
} from "@/types/quotations.types";
import {
  MAX_LINE_ITEM_DESCRIPTION_LENGTH,
  quotationDeliveryDaysRange,
  quotationGraceDaysRange,
  quotationValidityRange,
} from "@/utils/constants.utils";
import { ERROR_MESSAGES } from "@/utils/error.utils";
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

// =================================   commented to be removed   ==========================================
// export const verifyTcs = ({
//   selectedTcs,
//   quotationType,
//   editTcs,
// }: {
//   selectedTcs: TcsDto;
//   quotationType: Quotation_type;
//   editTcs: boolean;
// }): ObjectVerifyResponse => {
//   if (!editTcs) {
//     return { valid: true };
//   }

//   let isOkay = true;
//   const errArr: string[] = [];

//   const {
//     edited_validity_days,
//     edited_payment_grace_days,
//     edited_initial_payment_percentage,
//     edited_last_payment_percentage,
//     edited_delivery_days,
//   } = selectedTcs;

//   if (
//     !edited_validity_days ||
//     !isWithinRange(edited_validity_days, quotationValidityRange)
//   ) {
//     isOkay = false;
//     errArr.push(ERROR_MESSAGES.INVALID_VALIDITY);
//   }

//   if (
//     !edited_delivery_days ||
//     !isWithinRange(edited_delivery_days, quotationDeliveryDaysRange)
//   ) {
//     isOkay = false;
//     errArr.push(ERROR_MESSAGES.INVALID_DELIVERY);
//   }

//   if (quotationType.type_id == 1) {
//     //Supply of Products
//     if (
//       !edited_payment_grace_days ||
//       !isWithinRange(edited_payment_grace_days, quotationGraceDaysRange)
//     ) {
//       isOkay = false;
//       errArr.push(ERROR_MESSAGES.INVALID_GRACE);
//     }
//   } else {
//     if (
//       !edited_initial_payment_percentage ||
//       !edited_last_payment_percentage ||
//       edited_initial_payment_percentage + edited_last_payment_percentage !== 100
//     ) {
//       isOkay = false;
//       errArr.push(ERROR_MESSAGES.INVALID_PERCENTAGES);
//     }
//   }

//   return { valid: isOkay, errors: errArr };
// };

// =================================   added   ==========================================
export const verifyTcs = ({
  selectedTcs,
  quotationType,
  editTcs,
}: {
  selectedTcs: TcsDto;
  quotationType: Quotation_type;
  editTcs: boolean;
}): ObjectVerifyResponse => {
  if (!editTcs) {
    return { valid: true };
  }

  let isOkay = true;
  const errArr: string[] = [];

  const {
    edited_validity_days,
    edited_payment_grace_days,
    edited_initial_payment_percentage,
    edited_last_payment_percentage,
    edited_delivery_days,
  } = selectedTcs;

  // Validity days check
  if (
    edited_validity_days == null || // allow 0 but not null/undefined
    !isWithinRange(edited_validity_days, quotationValidityRange)
  ) {
    isOkay = false;
    errArr.push(ERROR_MESSAGES.INVALID_VALIDITY);
  }

  // Delivery days check
  if (
    edited_delivery_days == null || // allow 0 but not null/undefined
    !isWithinRange(edited_delivery_days, quotationDeliveryDaysRange)
  ) {
    isOkay = false;
    errArr.push(ERROR_MESSAGES.INVALID_DELIVERY);
  }

  // Payment grace days check for type 1
  if (quotationType.type_id == 1) {
    if (
      edited_payment_grace_days == null || // allow 0 but not null/undefined
      !isWithinRange(edited_payment_grace_days, quotationGraceDaysRange)
    ) {
      isOkay = false;
      errArr.push(ERROR_MESSAGES.INVALID_GRACE);
    }
  } else {
    // Percentage validation
    if (
      edited_initial_payment_percentage == null ||
      edited_last_payment_percentage == null ||
      edited_initial_payment_percentage + edited_last_payment_percentage !== 100
    ) {
      isOkay = false;
      errArr.push(ERROR_MESSAGES.INVALID_PERCENTAGES);
    }
  }

  return { valid: isOkay, errors: errArr };
};

export const verifyClientInfo = (
  clientData: QuotationInputClientData
): ObjectVerifyResponse => {
  const errArr: string[] = [];
  let atLeastNameOrContactPerson = false;

  const keys = Object.keys(clientData) as (keyof QuotationClientData)[];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = clientData[key];
    try {
      if (
        (key === "name" && value && String(value).length > 2) ||
        (key === "contactPerson" && value && String(value).length > 2)
      ) {
        atLeastNameOrContactPerson = true;
      }

      if (String(value).length > 64) {
        errArr.push(
          `${capitalizeFirstLetter(
            key
          )} field is too long. Reduce to a max of 64 Characters`
        );
      }

      if (
        key == "email" &&
        value &&
        !validateEmailAddress(String(value ?? "").trim())
      ) {
        errArr.push(`Invalid email address.`);
      }

      if (key == "phone" && value) {
        try {
          const formattedPhone = formatPhoneNumber(String(value));
          if (!validatePhoneNumber(formattedPhone)) {
            errArr.push(`Invalid phone number.`);
          }
        } catch (err) {
          errArr.push(`Invalid phone number.`);
        }
      }
    } catch (err) {
      logger.error(err);
      errArr.push(`Invalid inputs on field ${capitalizeFirstLetter(key)}`);
    }
  }

  if (!atLeastNameOrContactPerson) {
    errArr.push(
      `At least the client name or contact person must be provided, with at least 3 characters.`
    );
  }

  return errArr.length > 0 ? { valid: false, errors: errArr } : { valid: true };
};

export const verifyLineItems = (
  lineItems: QuotationInputLineItem[]
): ObjectVerifyResponse => {
  const errArr: string[] = [];

  if (lineItems.length < 1) {
    errArr.push(`No items provided.`);
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
          if (String(value).length < 2) {
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
      errArr.push(errorMessage);
    }
  });

  return errArr.length > 0 ? { valid: false, errors: errArr } : { valid: true };
};

export const calculateQuotationPricesSummary = ({
  lineItems,
  excludeVat,
  selectedTcs,
}: {
  lineItems: RawQuotationLineItem[];
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

export const processQuotationLineItems = (
  lineItems: QuotationInputLineItem[],
  excludeVat: boolean,
  tcs: TcsDto
): {
  lineItems: RawQuotationLineItem[];
  vat: number;
  sub_total: number;
  grand_total: number;
} => {
  const _lineItems: RawQuotationLineItem[] = [];
  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];
    const qty = item.quantity;
    const price = item.unitPrice;
    if (!qty || !price) continue;

    _lineItems.push({
      name: item.name!.trim(),
      description: item.description ? item.description.trim() : null,
      quantity: qty,
      unitPrice: price,
      units: item.units!.trim(),
    });
  }

  const priceSummary = calculateQuotationPricesSummary({
    lineItems: _lineItems,
    excludeVat: excludeVat,
    selectedTcs: tcs,
  });

  return {
    grand_total: priceSummary.finalTotal,
    sub_total: priceSummary.subtotal,
    vat: priceSummary.vat,
    lineItems: _lineItems,
  };
};
