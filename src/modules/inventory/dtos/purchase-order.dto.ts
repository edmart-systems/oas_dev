import { z } from "zod";

export const PurchaseOrderItemDto = z.object({
  product_id: z.number().positive(),
  description: z.string().optional(),
  quantity_ordered: z.number().positive(),
  unit_price: z.number().positive(),
  total_price: z.number().positive(),
});

export const PurchaseOrderTCDto = z.object({
  validity_days: z.number().positive(),
  validity_words: z.string().optional(),
  payment_grace_days: z.number().optional(),
  payment_words: z.string().optional(),
  vat_percentage: z.number().min(0).max(100).default(18),
});

export const CreatePurchaseOrderDto = z.object({
  supplier_id: z.number().positive(),
  currency_id: z.number().positive(),
  expected_delivery: z.string().datetime().optional(),
  remarks: z.string().optional(),
  items: z.array(PurchaseOrderItemDto).min(1),
  termsConditions: PurchaseOrderTCDto.optional(),
});

export const PurchaseOrderFilterDto = z.object({
  status: z.string().optional(),
  supplier_id: z.number().optional(),
  requester_id: z.number().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
});

export const PaginatedPOParamsDto = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10),
  filter: PurchaseOrderFilterDto.optional(),
});

export const POApprovalActionDto = z.object({
  po_id: z.number().positive(),
  status: z.enum(['Approved', 'Rejected']),
  remarks: z.string().optional(),
});

export const POStatusUpdateDto = z.object({
  po_id: z.number().positive(),
  status: z.enum(['Issued', 'Cancelled']),
});

export const PurchaseOrderDraftDto = z.object({
  supplier_id: z.number().optional(),
  currency_id: z.number().optional(),
  expected_delivery: z.string().datetime().optional(),
  remarks: z.string().optional(),
  items: z.array(PurchaseOrderItemDto),
  total_amount: z.number().optional(),
});