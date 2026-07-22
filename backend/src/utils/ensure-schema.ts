import { pool, prisma } from "../config/database.js";

/** Idempotent SQL matching the current Prisma schema (final shape). */
const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS "Business" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Business_businessId_key" ON "Business"("businessId");
CREATE UNIQUE INDEX IF NOT EXISTS "Business_slug_key" ON "Business"("slug");

CREATE TABLE IF NOT EXISTS "Role" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "permissions" TEXT NOT NULL DEFAULT '[]',
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Role_businessId_idx" ON "Role"("businessId");
CREATE UNIQUE INDEX IF NOT EXISTS "Role_businessId_name_key" ON "Role"("businessId", "name");

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'OWNER',
  "roleId" TEXT,
  "businessId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "User_businessId_idx" ON "User"("businessId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_businessId_email_key" ON "User"("businessId", "email");

CREATE TABLE IF NOT EXISTS "Assignment" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "workerId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "dueDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Assignment_businessId_idx" ON "Assignment"("businessId");
CREATE INDEX IF NOT EXISTS "Assignment_workerId_idx" ON "Assignment"("workerId");
CREATE INDEX IF NOT EXISTS "Assignment_status_idx" ON "Assignment"("status");

CREATE TABLE IF NOT EXISTS "Proof" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Proof_assignmentId_idx" ON "Proof"("assignmentId");

CREATE TABLE IF NOT EXISTS "Vehicle" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "name" TEXT NOT NULL DEFAULT '',
  "headPlateNumber" TEXT NOT NULL,
  "trailerPlateNumber" TEXT,
  "category" TEXT NOT NULL DEFAULT 'owned',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "mileage" INTEGER NOT NULL DEFAULT 0,
  "fuelLevel" INTEGER NOT NULL DEFAULT 100,
  "fuelType" TEXT NOT NULL DEFAULT '',
  "vehicleType" TEXT NOT NULL DEFAULT 'truck',
  "insuranceExpiry" TIMESTAMP(3),
  "licenseExpiry" TIMESTAMP(3),
  "documentsJson" TEXT NOT NULL DEFAULT '{}',
  "assignedDriverId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Vehicle_businessId_idx" ON "Vehicle"("businessId");
CREATE INDEX IF NOT EXISTS "Vehicle_status_idx" ON "Vehicle"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "Vehicle_businessId_headPlateNumber_key" ON "Vehicle"("businessId", "headPlateNumber");

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "customerCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "email" TEXT,
  "contactPerson" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Customer_businessId_idx" ON "Customer"("businessId");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_businessId_customerCode_key" ON "Customer"("businessId", "customerCode");

CREATE TABLE IF NOT EXISTS "Supplier" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "supplierCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contact" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "buyingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Supplier_businessId_idx" ON "Supplier"("businessId");
CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_businessId_supplierCode_key" ON "Supplier"("businessId", "supplierCode");

CREATE TABLE IF NOT EXISTS "Shipment" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "shipmentCode" TEXT NOT NULL,
  "supplierId" TEXT,
  "customerId" TEXT,
  "vehicleId" TEXT,
  "driverId" TEXT,
  "origin" TEXT NOT NULL DEFAULT '',
  "destination" TEXT NOT NULL DEFAULT '',
  "quantityTons" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "deliveryStatus" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "scheduledDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Shipment_businessId_idx" ON "Shipment"("businessId");
CREATE INDEX IF NOT EXISTS "Shipment_status_idx" ON "Shipment"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "Shipment_businessId_shipmentCode_key" ON "Shipment"("businessId", "shipmentCode");

CREATE TABLE IF NOT EXISTS "Delivery" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "deliveryCode" TEXT NOT NULL,
  "shipmentId" TEXT,
  "customerId" TEXT,
  "vehicleId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Delivery_businessId_idx" ON "Delivery"("businessId");
CREATE UNIQUE INDEX IF NOT EXISTS "Delivery_businessId_deliveryCode_key" ON "Delivery"("businessId", "deliveryCode");

CREATE TABLE IF NOT EXISTS "MaintenanceRecord" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "maintenanceDate" TIMESTAMP(3) NOT NULL,
  "maintenanceType" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "workshop" TEXT NOT NULL DEFAULT '',
  "mechanic" TEXT NOT NULL DEFAULT '',
  "currentMileage" INTEGER NOT NULL DEFAULT 0,
  "laborCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "partsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "otherCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "nextServiceDate" TIMESTAMP(3),
  "nextServiceMileage" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "detailsJson" TEXT NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MaintenanceRecord_businessId_idx" ON "MaintenanceRecord"("businessId");
CREATE INDEX IF NOT EXISTS "MaintenanceRecord_vehicleId_idx" ON "MaintenanceRecord"("vehicleId");
CREATE INDEX IF NOT EXISTS "MaintenanceRecord_status_idx" ON "MaintenanceRecord"("status");

ALTER TABLE "MaintenanceRecord" ADD COLUMN IF NOT EXISTS "detailsJson" TEXT NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS "MaintenancePart" (
  "id" TEXT NOT NULL,
  "maintenanceId" TEXT NOT NULL,
  "partName" TEXT NOT NULL,
  "brand" TEXT NOT NULL DEFAULT '',
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "supplier" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "MaintenancePart_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MaintenancePart_maintenanceId_idx" ON "MaintenancePart"("maintenanceId");

CREATE TABLE IF NOT EXISTS "MaintenanceAttachment" (
  "id" TEXT NOT NULL,
  "maintenanceId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL DEFAULT '',
  "category" TEXT NOT NULL DEFAULT 'OTHER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MaintenanceAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MaintenanceAttachment_maintenanceId_idx" ON "MaintenanceAttachment"("maintenanceId");

CREATE TABLE IF NOT EXISTS "Invoice" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "customerId" TEXT,
  "shipmentId" TEXT,
  "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Invoice_businessId_idx" ON "Invoice"("businessId");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_businessId_invoiceNumber_key" ON "Invoice"("businessId", "invoiceNumber");

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "invoiceId" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'CASH',
  "note" TEXT NOT NULL DEFAULT '',
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Payment_businessId_idx" ON "Payment"("businessId");
CREATE INDEX IF NOT EXISTS "Payment_invoiceId_idx" ON "Payment"("invoiceId");

DO $$ BEGIN
  ALTER TABLE "Role" ADD CONSTRAINT "Role_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_workerId_fkey"
    FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Proof" ADD CONSTRAINT "Proof_assignmentId_fkey"
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Proof" ADD CONSTRAINT "Proof_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_assignedDriverId_fkey"
    FOREIGN KEY ("assignedDriverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Customer" ADD CONSTRAINT "Customer_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_supplierId_fkey"
    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_driverId_fkey"
    FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_shipmentId_fkey"
    FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MaintenancePart" ADD CONSTRAINT "MaintenancePart_maintenanceId_fkey"
    FOREIGN KEY ("maintenanceId") REFERENCES "MaintenanceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MaintenanceAttachment" ADD CONSTRAINT "MaintenanceAttachment_maintenanceId_fkey"
    FOREIGN KEY ("maintenanceId") REFERENCES "MaintenanceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_shipmentId_fkey"
    FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

async function businessTableExists(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "Business" LIMIT 1`;
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("42P01") || message.toLowerCase().includes("does not exist")) {
      return false;
    }
    throw error;
  }
}

async function runSqlBootstrap() {
  console.info("[boot] applying SQL schema bootstrap...");
  await pool.query(BOOTSTRAP_SQL);
}

/**
 * Ensures production DB matches Prisma schema before the API accepts traffic.
 * Always runs idempotent SQL for auth + SaaS tables, then verifies Business exists.
 */
export async function ensureDatabaseSchema() {
  await runSqlBootstrap();

  if (!(await businessTableExists())) {
    throw new Error('Schema sync finished but "Business" table is still missing.');
  }

  console.info("[boot] database schema ready");
}
