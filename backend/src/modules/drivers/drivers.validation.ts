import { z } from "zod";
import { DRIVER_SORT_FIELDS, DriverStatus } from "./drivers.types.js";

export const listDriversSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    sortBy: z.enum(DRIVER_SORT_FIELDS).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    status: z.nativeEnum(DriverStatus).optional(),
    licenseExpiryBefore: z.coerce.date().optional(),
  }),
  params: z.object({}).passthrough(),
});

export const driversParamsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: z.string().trim().min(1),
  }),
});

export const createDriversSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().min(5),
    email: z.string().trim().email().nullable().optional(),
    licenseNumber: z.string().trim().min(4),
    licenseExpiry: z.coerce.date().nullable().optional(),
    status: z.nativeEnum(DriverStatus).optional(),
    address: z.string().trim().min(2).nullable().optional(),
    emergencyContact: z.string().trim().min(2).nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateDriversSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).optional(),
    phone: z.string().trim().min(5).optional(),
    email: z.string().trim().email().nullable().optional(),
    licenseNumber: z.string().trim().min(4).optional(),
    licenseExpiry: z.coerce.date().nullable().optional(),
    status: z.nativeEnum(DriverStatus).optional(),
    address: z.string().trim().min(2).nullable().optional(),
    emergencyContact: z.string().trim().min(2).nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({
    id: z.string().trim().min(1),
  }),
});
