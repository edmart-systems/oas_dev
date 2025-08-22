import { ItemRange } from "@/types/other.types";
import { QuotationDocCommentary, QuotationId } from "@/types/quotations.types";
import { SignatureFonts } from "@/types/signature.types";
import { encryptMessage } from "./crypto.utils";

export const quotationValidityRange: ItemRange = {
  min: 1,
  max: 365,
};

export const quotationGraceDaysRange: ItemRange = {
  min: -365, // Negative => days BEFORE delivery
  max: 365,
};

export const quotationDeliveryDaysRange: ItemRange = {
  min: 1,
  max: 365,
};

export const signatureFonts: SignatureFonts = {
  "Lavishly Your": {},
  "Playwrite IN": {},
  "Princess Sofia": {},
  "Send Flowers": {},
  "Style Script": {},
  Borel: {},
  Yellowtail: {},
  Vibur: {},
};

export const quotationPdfCommentary: QuotationDocCommentary = {
  IT: {
    content:
      "We are pleased to present our quotation for the items/services as per your request. Edmart Systems (U) Limited specializes in providing cutting-edge technology solutions, including networking, software, security systems, web hosting, and IT supplies. We are authorized dealers of Dell, HP, Lenovo, Canon, Epson, Microsoft, Cisco, Kaspersky, HIKVision, Bitdefender, and more. We guarantee genuine products and expert services.",
  },
  Stationery: {
    content:
      "Thank you for your interest in our stationery offerings. Edmart Systems (U) Limited is a trusted supplier of premium office and school supplies, including printing essentials, writing instruments, and paper products. Our focus is on delivering high-quality items tailored to your operational needs, ensuring affordability and reliability. We look forward to being your partner in maintaining seamless day-to-day operations with our carefully curated range of stationery products.",
  },
  General: {
    content:
      "We are pleased to provide you with our quotation for the items requested. Edmart Systems (U) Limited is a versatile supplier with expertise in delivering a broad range of products and services to meet diverse business needs. From IT solutions to general supplies, we strive to ensure quality, reliability, and value for our esteemed customers.",
  },
};

export const MAXIMUM_QUOTATION_EDITS: number = 5;

export const MAXIMUM_QUOTATION_DRAFTS: number = 5;

export const SESSION_CHECK_HEARTBEAT_INTERVAL_MINUTES: number = 0.5;

export const MAXIMUM_UI_INACTIVITY_MINUTES: number =
  process.env.NODE_ENV === "production" ? 10 : 5;

export const UI_ACTIVITY_HEARTBEAT_INTERVAL_MINUTES: number = 0.1; // 6 seconds

export const PRIMARY_COLOR: string = "#D98219";

export const quotationVerificationUrl = (
  id: QuotationId,
  key: string,
  isVariant: boolean
) =>
  `https://verify.edmartsystems.com/doc/quotation/${encryptMessage(
    isVariant ? `${id.quotationNumber}.${id.quotationId}` : id.quotationNumber,
    key
  )}`;

export const MAX_LINE_ITEM_DESCRIPTION_LENGTH = 700; // Max = 1000

export const QUOTATION_PDF_TABLE_FLEX_WEIGHT = {
  sn: 0.5,
  desc: 4,
  qty: 0.7,
  unit: 1.6,
  px: 1.6,
  tt: 1.6,
  summaryCol1: 8.4 + 0.43,
  summaryCol2: 1.6,
};

export const MAX_NOTIFICATION_AGE_IN_DAYS = 90;

export const LOCAL_TIMEZONE = "Africa/Kampala";

export const MAX_TAG_MESSAGE_LENGTH = 500;

export const TAB_SESSION_COOKIE_NAME = "1ZK121";

export const INVALID_RANGE_RESPONSE = "Invalid Range";

export const BAD_REQUEST_RESPONSE = "Bad Request";

export const NOT_AUTHORIZED_RESPONSE = "Not Authorized";

export const NOT_FOUND_RESPONSE = "Not Found";

export const MAX_TASK_EXPIRY_DAYS = 15;

export const TASKS_TIME_LOWER_THRESHOLD = 1577869200000; //1 Jan 2020, 12:00:00
