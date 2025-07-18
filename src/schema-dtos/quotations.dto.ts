import { z as zod } from "zod";
import { Currency2DtoSchema } from "./currency.dto";
import { BankDtoSchema } from "./company.dto";

export const QuotationTypeSchema = zod.object({
  type_id: zod.number(),
  name: zod.string(),
});

export const QuotationCategorySchema = zod.object({
  cat_id: zod.number(),
  cat: zod.string(),
});

export const TcsDtoSchema = zod.object({
  tc_id: zod.number(),
  delivery_days: zod.number(),
  delivery_words: zod.string(),
  validity_days: zod.number(),
  validity_words: zod.string().nullable(),
  payment_grace_days: zod.number().nullable(),
  payment_words: zod.string().nullable(),
  initial_payment_percentage: zod.number().nullable(),
  last_payment_percentage: zod.number().nullable(),
  payment_method_words: zod.string().nullable(),
  quotation_type_id: zod.number(),
  bank_id: zod.number(),
  vat_percentage: zod.number(),

  edited_validity_days: zod.number().nullable(),
  edited_delivery_days: zod.number().nullable(),
  edited_payment_grace_days: zod.number().nullable(),
  edited_initial_payment_percentage: zod.number().nullable(),
  edited_last_payment_percentage: zod.number().nullable(),

  bank: BankDtoSchema,
});

export const QuotationInputLineItemDtoSchema = zod.object({
  id: zod.number(),
  name: zod.string().nullable().optional(),
  description: zod.string().nullable().optional(),
  quantity: zod.number().nullable().optional(),
  units: zod.string().nullable().optional(),
  unitPrice: zod.number().nullable().optional(),
});

export const QuotationInputClientDataDtoSchema = zod.object({
  name: zod.string().nullable(),
  ref: zod.string().nullable(),
  contactPerson: zod.string().nullable(),
  email: zod.string().nullable(),
  phone: zod.string().nullable(),
  boxNumber: zod.number().nullable(),
  country: zod.string().nullable(),
  city: zod.string().nullable(),
  addressLine1: zod.string().nullable(),
});

export const NewQuotationDtoSchema = zod.object({
  quotationId: zod.number(),
  time: zod.number(),
  type: QuotationTypeSchema,
  category: QuotationCategorySchema,
  tcsEdited: zod.boolean(),
  vatExcluded: zod.boolean(),
  tcs: TcsDtoSchema,
  currency: Currency2DtoSchema,
  clientData: QuotationInputClientDataDtoSchema,
  lineItems: zod.array(QuotationInputLineItemDtoSchema),
});
