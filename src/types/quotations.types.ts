import {
  Edited_quotation,
  Quotation,
  Quotation_category,
  Quotation_client_data,
  Quotation_items,
  Quotation_status,
  Quotation_tcs,
  Quotation_type,
  Unit,
  User,
} from "@prisma/client";
import { ReactElement } from "react";
import { BankDto, CompanyDto } from "./company.types";
import { Currency2 } from "./currency.types";
import { MUIColor, MUIColorWithInherit, PaginationData } from "./other.types";
import { SummarizedUser, UserSignatureDto } from "./user.types";

export type QuotationStatusKey =
  | "created"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

export type QuotationFilterKeys =
  | "id"
  | "status"
  | "user"
  | "client"
  | "category"
  | "start"
  | "end";

export type QuotationCategoryKey = "IT" | "Stationery" | "General";

export type QuotationCategoryKeyNullable = QuotationCategoryKey | "";

export type QuotationFilters = {
  id?: string | null;
  status?: string | null;
  category?: string | null;
  user?: string | null;
  client?: string | null;
  start: string;
  end: string;
  dataAltered: boolean;
};

export type QuotationStatusKeyNullable = QuotationStatusKey | "";

// export const compareFilters = (
//   prev: QuotationFilters,
//   current: QuotationFilters
// ): boolean => {
//   let isMatching = true;
//   const entries = Object.entries(prev);

//   for (let i = 0; i < entries.length; i++) {
//     const [key, value] = entries[i];
//     const _key = key as QuotationFilterKeys;

//     if (current[_key] !== value) {
//       isMatching = false;
//       break;
//     }
//   }

//   return isMatching;
// };

export type QuotationStatusActionType = "setAccepted" | "setRejected";

export type QuotationStatusAction = {
  [key in QuotationStatusKey]: {
    name: QuotationStatusKey;
    label: string;
    desc: string;
    color: MUIColorWithInherit;
    icon: ReactElement;
  }[];
};

export type TcsDto = Omit<Quotation_tcs, "created_at" | "updated_at"> & {
  edited_validity_days: number | null;
  edited_delivery_days: number | null;
  edited_payment_grace_days: number | null;
  edited_initial_payment_percentage: number | null;
  edited_last_payment_percentage: number | null;

  bank: BankDto;
};

export type Unit2 = Omit<Unit, "unit_desc" | "updated_at" | "created_at">;

export type CreateQuotationPageData = {
  company: CompanyDto;
  quotationTypes: Quotation_type[];
  quotationCategories: Quotation_category[];
  tcs: TcsDto[];
  units: Unit2[];
  currencies: Currency2[];
  userSignature: UserSignatureDto | null;
};

export type EditQuotationPageData = CreateQuotationPageData & {
  quotation: Omit<FullQuotation, "signature">;
};

export type QuotationInputClientData = {
  name: string | null;
  ref: string | null;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  boxNumber: number | null;
  country: string | null;
  city: string | null;
  addressLine1: string | null;
};

export type QuotationClientData = {
  name: string;
  ref: string | null;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  boxNumber: number | null;
  country: string | null;
  city: string | null;
  addressLine1: string | null;
};

export type QuotationInputLineItem = {
  id: number;
  name?: string | null;
  description?: string | null;
  quantity?: number | null;
  units?: string | null;
  unitPrice?: number | null;
};

export type QuotationOutputLineItem = {
  id: number;
  name: string;
  description?: string | null;
  quantity: number;
  units: string;
  unitPrice: number;
};

export type QuotationPriceSummary = {
  subtotal: number;
  vat: number;
  finalTotal: number;
};

export type QuotationError = {
  id?: number;
  message: string;
  origin: "TCs" | "Client Info" | "Line Items" | "Root";
};

export type NewQuotation = {
  quotationId: number;
  time: number;
  type: Quotation_type;
  category: Quotation_category;
  tcsEdited: boolean;
  vatExcluded: boolean;
  tcs: TcsDto;
  currency: Currency2;
  clientData: QuotationInputClientData;
  lineItems: QuotationInputLineItem[];
};

export type NewEditQuotationData = Omit<NewQuotation, "quotationId"> & {
  createTime: number;
  quotationId: string;
};

export type QuotationDraftPreviewData = Omit<NewQuotation, "quotationId"> & {
  quotationId: number | string;
  grandTotal: number;
  subtotal: number;
  vat: number;
  signature: UserSignatureDto | null;
  user: Pick<User, "co_user_id" | "firstName" | "lastName" | "profile_picture">;
};

export type QuotationDraftSummary = {
  quotationId: number;
  name: string;
};

export type AutoDraftMetadata = {
  userId: number;
  timestamp: number;
  draftType: 'auto' | 'manual';
};

export type QuotationDraftWithMetadata = NewQuotation & AutoDraftMetadata;

export type QuotationObjectVerifyResponse = {
  valid: boolean;
  errors?: QuotationError[];
};

export type RawQuotationData = Omit<
  Quotation,
  | "id"
  | "client_data_id"
  | "created_at"
  | "updated_at"
  | "client_data_id"
  | "status_id"
  | "edited"
>;

export type RawClientQuotationData = Omit<Quotation_client_data, "client_id">;

export type RawQuotationLineItem = Omit<
  Quotation_items,
  "item_id" | "quot_id" | "edited_quot_id"
>;

export type NewRawQuotation = {
  quotationData: RawQuotationData;
  clientData: RawClientQuotationData;
  lineItems: RawQuotationLineItem[];
};

export type RawEditQuotationData = Omit<
  Edited_quotation,
  | "id"
  | "client_data_id"
  | "created_at"
  | "updated_at"
  | "client_data_id"
  | "status_id"
>;

export type NewRawEditQuotation = {
  quotationData: RawEditQuotationData;
  clientData: RawClientQuotationData;
  lineItems: RawQuotationLineItem[];
};

export type QuotationStatusCounts = {
  [keys in QuotationStatusKey | "all"]: {
    count: number;
  };
};

export type PaginatedQuotationsParameter = {
  userId: string;
  limit: number;
  offset: number;
  filterParams?: QuotationFilters;
};

export type QuotationId = {
  quotationNumber: string;
  quotationId: number;
};

export type SummarizedQuotation = {
  id: number;
  quotationId: string;
  time: number;
  status_id: number;
  status: string;
  category: string;
  external_ref: string | null;
  grandTotal: number;
  subtotal: number;
  vat: number;
  vatExcluded: number;
  validityDays: number;
  clientName: string | null;
  contactPerson: string | null;
  currency: string;
  userId: string;
  userName: string;
  expiryTime: number;
  isExpired: boolean;
  profilePic: string | null;
  edited: boolean;
  variants?: EditedSummarizedQuotation[];
  isVariant: boolean;
};

export type EditedSummarizedQuotation = Omit<SummarizedQuotation, "edited"> & {
  createdTime: number;
};

export type PaginatedQuotations = {
  quotations: SummarizedQuotation[];
  pagination: PaginationData;
};

export type QuotationTaggedUser = SummarizedUser;

export type FullQuotation = {
  id: number;
  quotationId: string;
  time: number;
  createdTime: number;
  type: Quotation_type;
  category: Quotation_category;
  tcsEdited: boolean;
  vatExcluded: boolean;
  tcs: TcsDto;
  currency: Currency2;
  clientData: QuotationInputClientData;
  lineItems: QuotationOutputLineItem[];
  user: Pick<
    User,
    "co_user_id" | "firstName" | "lastName" | "otherName" | "profile_picture"
  >;
  status: Quotation_status;
  expiryTime: number;
  isExpired: boolean;
  subTotal: number;
  vat: number;
  grandTotal: number;
  signature: UserSignatureDto;
  edited: boolean;
  isVariant: boolean;
  taggedUsers: QuotationTaggedUser[] | null;
};

export type SingleQuotationPageData = {
  company: CompanyDto;
  quotation: FullQuotation & {
    variants: EditedSummarizedQuotation[];
  };
};

export type SingleEditedQuotationPageData = {
  company: CompanyDto;
  quotation: FullQuotation;
};

export type QuotationCategoryName = "IT" | "Stationery" | "General";

export type QuotationDocCommentary = {
  [key in QuotationCategoryName]: {
    content: string;
  };
};

export type QuotationVerificationStatus = {
  quotationStatus: "active" | "expired";
  quotationNumber: string;
  issueDate: string;
};

export type QuotationWithUserAndClient = Quotation & {
  user: User;
  client_data: Quotation_client_data;
};

export type EditedQuotationWithUserAndClient = Edited_quotation & {
  user: User;
  client_data: Quotation_client_data;
};

export type QuotationsForRemainder = {
  firstTime: (QuotationWithUserAndClient | EditedQuotationWithUserAndClient)[];
  lastTime: (QuotationWithUserAndClient | EditedQuotationWithUserAndClient)[];
};
