import { z } from "zod";

const billingStatuses = ["DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"] as const;
const billingSortFields = ["createdAt", "issueDate", "dueDate", "invoiceNumber", "totalAmount", "balanceAmount", "status"] as const;
const idSchema = z.string().min(1);

export const listBillingSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    search: z.string().trim().min(1).optional(),
    status: z.enum(billingStatuses).optional(),
    customerId: idSchema.optional(),
    shipmentId: idSchema.optional(),
    issueDateFrom: z.coerce.date().optional(),
    issueDateTo: z.coerce.date().optional(),
    dueDateFrom: z.coerce.date().optional(),
    dueDateTo: z.coerce.date().optional(),
    outstandingOnly: z.coerce.boolean().optional(),
    sortBy: z.enum(billingSortFields).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
  params: z.object({}).passthrough(),
});

export const getBillingSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const createBillingSchema = z.object({
  body: z.object({
    invoiceNumber: z.string().trim().min(2).max(50),
    customerId: idSchema.optional(),
    shipmentId: idSchema.optional(),
    issueDate: z.coerce.date(),
    dueDate: z.coerce.date(),
    subtotal: z.coerce.number().min(0),
    taxAmount: z.coerce.number().min(0).optional(),
    totalAmount: z.coerce.number().min(0).optional(),
    paidAmount: z.coerce.number().min(0).optional(),
    status: z.enum(billingStatuses).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateBillingSchema = z.object({
  body: z
    .object({
      invoiceNumber: z.string().trim().min(2).max(50).optional(),
      customerId: idSchema.optional(),
      shipmentId: idSchema.optional(),
      issueDate: z.coerce.date().optional(),
      dueDate: z.coerce.date().optional(),
      subtotal: z.coerce.number().min(0).optional(),
      taxAmount: z.coerce.number().min(0).optional(),
      totalAmount: z.coerce.number().min(0).optional(),
      paidAmount: z.coerce.number().min(0).optional(),
      status: z.enum(billingStatuses).optional(),
      notes: z.string().trim().max(1000).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required."),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const deleteBillingSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const billingSummarySchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    customerId: idSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
  params: z.object({}).passthrough(),
});
