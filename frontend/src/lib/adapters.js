function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function fromEnum(value, fallback = "") {
  return value ? value.toLowerCase() : fallback;
}

function normalizeMaintenanceStatus(value) {
  const normalized = fromEnum(value);
  if (normalized === "in_progress") return "inProgress";
  return normalized;
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeShipmentStatus(value) {
  const normalized = fromEnum(value);
  if (normalized === "in_transit") return "transit";
  return normalized;
}

export function mapFleetRecord(record) {
  const metadata = asObject(record.documentsJson);
  return {
    id: record.id,
    ownership: record.category?.toLowerCase() === "rented" || metadata.ownership === "rented" ? "rented" : "owned",
    headPlate: record.headPlateNumber,
    trailerPlate: record.trailerPlateNumber ?? "",
    driver: record.assignedDriver?.fullName ?? metadata.driverName ?? "Unassigned",
    driverPhone: record.assignedDriver?.phone ?? metadata.driverPhone ?? "",
    licenseNumber: metadata.licenseNumber ?? "",
    status: fromEnum(record.status, "active"),
    routes: Number(metadata.routes ?? 0),
    mileage: record.mileage ?? 0,
    fuelLevel: record.fuelLevel ?? 0,
    fuelType: record.fuelType ?? "",
    insuranceExpiry: toDateInput(record.insuranceExpiry),
    licenseExpiry: toDateInput(record.licenseExpiry),
    documentsJson: record.documentsJson ?? null,
    vehicleType: record.vehicleType,
    assignedDriverId: record.assignedDriverId ?? "",
    raw: record,
  };
}

export function mapCustomerRecord(record) {
  return {
    id: record.customerCode,
    entityId: record.id,
    code: record.customerCode,
    name: record.name,
    email: record.email ?? "",
    phone: record.phone ?? "",
    location: record.location ?? "",
    contactPerson: record.contactPerson ?? "",
    notes: record.notes ?? "",
    shipmentsCount: record.shipmentsCount ?? 0,
    raw: record,
  };
}

export function mapSupplierRecord(record) {
  return {
    id: record.supplierCode,
    entityId: record.id,
    code: record.supplierCode,
    name: record.name,
    phone: record.contact ?? "",
    location: record.location ?? "",
    buyingPrice: record.buyingPrice ?? 0,
    sellingPrice: record.sellingPrice ?? 0,
    shipmentsCount: record.shipmentsCount ?? 0,
    raw: record,
  };
}

export function mapShipmentRecord(record) {
  return {
    id: record.id,
    shipmentCode: record.shipmentCode,
    supplierId: record.supplierId ?? "",
    origin: record.origin,
    customerId: record.customerId ?? "",
    customer: record.customer?.name ?? "Unassigned customer",
    destination: record.destination,
    quantity: record.quantityTons ?? 0,
    unit: "tons",
    vehicle: record.vehicle?.headPlateNumber ?? "Unassigned vehicle",
    vehicleId: record.vehicleId ?? "",
    driverId: record.driverId ?? "",
    date: toDateInput(record.scheduledDate ?? record.createdAt),
    status: normalizeShipmentStatus(record.status),
    deliveryStatus: fromEnum(record.deliveryStatus),
    raw: record,
  };
}

export function mapDeliveryRecord(record) {
  return {
    id: record.id,
    deliveryCode: record.deliveryCode,
    date: toDateInput(record.deliveredAt ?? record.createdAt),
    origin: record.shipment?.origin ?? "Unknown origin",
    customer: record.customer?.name ?? record.shipment?.customer?.name ?? "Unknown customer",
    destination: record.shipment?.destination ?? "Unknown destination",
    vehicle: record.vehicle?.headPlateNumber ?? record.shipment?.vehicle?.headPlateNumber ?? "Unassigned vehicle",
    quantity: record.shipment?.quantityTons ?? 0,
    unit: "tons",
    status: record.status === "COMPLETED" ? "delivered" : normalizeShipmentStatus(record.status),
    raw: record,
  };
}

export function mapMaintenanceRecord(record) {
  return {
    id: record.id,
    vehicleId: record.vehicleId,
    vehicleLabel: `${record.vehicle?.headPlateNumber ?? ""}${record.vehicle?.trailerPlateNumber ? ` / ${record.vehicle.trailerPlateNumber}` : ""} - ${record.vehicle?.assignedDriver?.fullName ?? "Unassigned"}`,
    plateNumber: record.vehicle?.headPlateNumber ?? "",
    serviceDate: toDateInput(record.maintenanceDate),
    maintenanceType: record.maintenanceType,
    description: record.description ?? "",
    workshop: record.workshop,
    mechanic: record.mechanic,
    currentMileage: record.currentMileage,
    laborCost: record.laborCost ?? 0,
    partsCost: record.partsCost ?? 0,
    otherExpenses: record.otherCost ?? 0,
    totalCost: record.totalCost ?? 0,
    nextServiceDate: toDateInput(record.nextServiceDate),
    nextServiceMileage: record.nextServiceMileage ?? "",
    status: normalizeMaintenanceStatus(record.status),
    notes: "",
    parts: (record.parts ?? []).map((part) => ({
      id: part.id,
      partName: part.partName,
      brand: part.brand ?? "",
      quantity: part.quantity ?? 1,
      unitPrice: part.unitPrice ?? 0,
      totalPrice: part.totalPrice ?? 0,
      supplier: part.supplier ?? "",
    })),
    files: (record.attachments ?? []).map((file) => ({
      id: file.id,
      name: file.fileName,
      url: file.fileUrl,
      mimeType: file.mimeType ?? "",
      category: file.category,
    })),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    raw: record,
  };
}

export function mapInvoiceToPaymentCard(record) {
  return {
    id: record.id,
    invoiceNumber: record.invoiceNumber,
    customer: record.customer?.name ?? "Unknown customer",
    customerId: record.customerId ?? "",
    total: record.totalAmount ?? 0,
    paid: record.paidAmount ?? 0,
    date: toDateInput(record.issueDate),
    dueDate: toDateInput(record.dueDate),
    status: fromEnum(record.status),
    raw: record,
  };
}

export function mapNotificationRecord(record) {
  return {
    id: record.id,
    title: record.title,
    text: record.message,
    time: toDateInput(record.createdAt),
    tone: record.status === "UNREAD" ? "brand" : "blue",
    type: record.type,
    raw: record,
  };
}

export function createDashboardActivity(notifications) {
  return notifications.slice(0, 8).map((notification) => ({
    ...notification,
    icon: notification.type?.includes("MAINTENANCE") ? null : null,
  }));
}
