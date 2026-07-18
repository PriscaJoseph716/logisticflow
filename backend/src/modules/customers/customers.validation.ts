import { z } from "zod";
import { CUSTOMER_SORT_FIELDS } from "./customers.types.js";

export const listCustomersSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    sortBy: z.enum(CUSTOMER_SORT_FIELDS).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    location: z.string().trim().min(1).optional(),
  }),
  params: z.object({}).passthrough(),
});

export const customersParamsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().trim().min(1) }),
});

export const createCustomersSchema = z.object({
  body: z.object({
    customerCode: z.string().trim().min(2),
    name: z.string().trim().min(2),
    email: z.string().trim().email().nullable().optional(),
    phone: z.string().trim().min(5).nullable().optional(),
    location: z.string().trim().min(2).nullable().optional(),
    contactPerson: z.string().trim().min(2).nullable().optional(),
    notes: z.string().trim().min(2).nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateCustomersSchema = z.object({
  body: z.object({
    customerCode: z.string().trim().min(2).optional(),
    name: z.string().trim().min(2).optional(),
    email: z.string().trim().email().nullable().optional(),
    phone: z.string().trim().min(5).nullable().optional(),
    location: z.string().trim().min(2).nullable().optional(),
    contactPerson: z.string().trim().min(2).nullable().optional(),
    notes: z.string().trim().min(2).nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().trim().min(1) }),
});
