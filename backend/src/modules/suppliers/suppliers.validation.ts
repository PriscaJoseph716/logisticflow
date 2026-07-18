import { z } from "zod";
import { SUPPLIER_SORT_FIELDS } from "./suppliers.types.js";

export const listSuppliersSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    sortBy: z.enum(SUPPLIER_SORT_FIELDS).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    location: z.string().trim().min(1).optional(),
  }),
  params: z.object({}).passthrough(),
});

export const suppliersParamsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().trim().min(1) }),
});

export const createSuppliersSchema = z.object({
  body: z.object({
    supplierCode: z.string().trim().min(2),
    name: z.string().trim().min(2),
    contact: z.string().trim().min(2).nullable().optional(),
    location: z.string().trim().min(2).nullable().optional(),
    buyingPrice: z.coerce.number().nonnegative().nullable().optional(),
    sellingPrice: z.coerce.number().nonnegative().nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateSuppliersSchema = z.object({
  body: z.object({
    supplierCode: z.string().trim().min(2).optional(),
    name: z.string().trim().min(2).optional(),
    contact: z.string().trim().min(2).nullable().optional(),
    location: z.string().trim().min(2).nullable().optional(),
    buyingPrice: z.coerce.number().nonnegative().nullable().optional(),
    sellingPrice: z.coerce.number().nonnegative().nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().trim().min(1) }),
});
