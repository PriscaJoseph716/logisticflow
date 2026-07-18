import { z } from "zod";

const paymentStatuses = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;
const paymentMethods = ["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CARD", "OTHER"] as const;
const paymentSortFields = ["createdAt", "paymentDate", "amount", "status", "method"] as const;
const idSchema = z.string().min(1);

export const listPaymentsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    search: z.string().trim().min(1).optional(),
    status: z.enum(paymentStatuses).optional(),
    method: z.enum(paymentMethods).optional(),
    customerId: idSchema.optional(),
    invoiceId: idSchema.optional(),
    paymentDateFrom: z.coerce.date().optional(),
    paymentDateTo: z.coerce.date().optional(),
    sortBy: z.enum(paymentSortFields).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
  params: z.object({}).passthrough(),
});

export const getPaymentSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const createPaymentSchema = z.object({
  body: z
    .object({
      invoiceId: idSchema.optional(),
      customerId: idSchema.optional(),
      amount: z.coerce.number().gt(0),
      paymentDate: z.coerce.date(),
      method: z.enum(paymentMethods),
      reference: z.string().trim().max(120).optional(),
      status: z.enum(paymentStatuses).optional(),
      notes: z.string().trim().max(1000).optional(),
    })
    .refine((payload) => Boolean(payload.invoiceId || payload.customerId), {
      message: "A payment must be linked to an invoice or customer.",
      path: ["invoiceId"],
    }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updatePaymentSchema = z.object({
  body: z
    .object({
      invoiceId: idSchema.optional(),
      customerId: idSchema.optional(),
      amount: z.coerce.number().gt(0).optional(),
      paymentDate: z.coerce.date().optional(),
      method: z.enum(paymentMethods).optional(),
      reference: z.string().trim().max(120).optional(),
      status: z.enum(paymentStatuses).optional(),
      notes: z.string().trim().max(1000).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required."),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const deletePaymentSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});
