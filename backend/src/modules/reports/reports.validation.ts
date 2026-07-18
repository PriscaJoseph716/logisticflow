import { z } from "zod";

const reportStatuses = ["QUEUED", "GENERATED", "FAILED"] as const;
const reportFormats = ["PDF", "EXCEL", "CSV"] as const;
const reportModules = ["shipments", "deliveries", "maintenance", "billing", "payments", "reports"] as const;
const reportSortFields = ["createdAt", "updatedAt", "generatedAt", "name", "module", "status"] as const;
const reportExportFormats = ["pdf", "excel", "csv"] as const;
const idSchema = z.string().min(1);

const filtersSchema = z.record(z.string(), z.unknown());

export const listReportsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    search: z.string().trim().min(1).optional(),
    module: z.enum(reportModules).optional(),
    format: z.enum(reportFormats).optional(),
    status: z.enum(reportStatuses).optional(),
    createdFrom: z.coerce.date().optional(),
    createdTo: z.coerce.date().optional(),
    sortBy: z.enum(reportSortFields).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
  params: z.object({}).passthrough(),
});

export const getReportSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const createReportSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    module: z.enum(reportModules),
    format: z.enum(reportFormats),
    status: z.enum(reportStatuses).optional(),
    filters: filtersSchema.optional(),
    fileUrl: z.string().url().optional(),
    generatedAt: z.coerce.date().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateReportSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).optional(),
      module: z.enum(reportModules).optional(),
      format: z.enum(reportFormats).optional(),
      status: z.enum(reportStatuses).optional(),
      filters: filtersSchema.optional(),
      fileUrl: z.string().url().optional(),
      generatedAt: z.coerce.date().optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required."),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const deleteReportSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const exportReportsSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    module: z.enum(reportModules),
    format: z.enum(reportExportFormats),
    filters: filtersSchema.optional(),
    columns: z.array(z.string().trim().min(1)).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});
