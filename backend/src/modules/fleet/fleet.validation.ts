import { z } from "zod";
import { FLEET_SORT_FIELDS, VehicleStatus } from "./fleet.types.js";

export const listFleetSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    sortBy: z.enum(FLEET_SORT_FIELDS).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    status: z.nativeEnum(VehicleStatus).optional(),
    vehicleType: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    assignedDriverId: z.string().trim().min(1).optional(),
  }),
  params: z.object({}).passthrough(),
});

export const fleetParamsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: z.string().trim().min(1),
  }),
});

export const createFleetSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    headPlateNumber: z.string().trim().min(2),
    trailerPlateNumber: z.string().trim().min(2).nullable().optional(),
    vehicleType: z.string().trim().min(2),
    category: z.string().trim().min(2).nullable().optional(),
    status: z.nativeEnum(VehicleStatus).optional(),
    insuranceExpiry: z.coerce.date().nullable().optional(),
    licenseExpiry: z.coerce.date().nullable().optional(),
    documentsJson: z.unknown().nullable().optional(),
    mileage: z.coerce.number().int().min(0).optional(),
    fuelLevel: z.coerce.number().min(0).optional(),
    fuelType: z.string().trim().min(2).nullable().optional(),
    assignedDriverId: z.string().trim().min(1).nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateFleetSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    headPlateNumber: z.string().trim().min(2).optional(),
    trailerPlateNumber: z.string().trim().min(2).nullable().optional(),
    vehicleType: z.string().trim().min(2).optional(),
    category: z.string().trim().min(2).nullable().optional(),
    status: z.nativeEnum(VehicleStatus).optional(),
    insuranceExpiry: z.coerce.date().nullable().optional(),
    licenseExpiry: z.coerce.date().nullable().optional(),
    documentsJson: z.unknown().nullable().optional(),
    mileage: z.coerce.number().int().min(0).optional(),
    fuelLevel: z.coerce.number().min(0).optional(),
    fuelType: z.string().trim().min(2).nullable().optional(),
    assignedDriverId: z.string().trim().min(1).nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({
    id: z.string().trim().min(1),
  }),
});
