import { jsPDF } from "jspdf";
import { formatReceiptMoney, moneyValue } from "./billingDocuments.js";

function downloadFileBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function rowsToCsv(headers, rows) {
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

export const REPORT_SECTOR_IDS = [
  "billing",
  "shipments",
  "deliveries",
  "fleet",
  "customers",
  "suppliers",
  "maintenance",
];

export function getSectorItems(appData, sectorId) {
  switch (sectorId) {
    case "billing":
      return appData.payments ?? [];
    case "shipments":
      return appData.shipments ?? [];
    case "deliveries":
      return appData.deliveries ?? [];
    case "fleet":
      return appData.fleet ?? [];
    case "customers":
      return appData.customers ?? [];
    case "suppliers":
      return appData.suppliers ?? [];
    case "maintenance":
      return appData.maintenanceRecords ?? [];
    default:
      return [];
  }
}

export function getSectorDateValue(item, sectorId) {
  switch (sectorId) {
    case "billing":
      return item.date || item.dueDate || item.raw?.issueDate;
    case "shipments":
    case "deliveries":
      return item.date;
    case "maintenance":
      return item.serviceDate;
    case "fleet":
      return item.raw?.createdAt || item.createdAt || "";
    case "customers":
    case "suppliers":
      return item.raw?.createdAt || item.createdAt || "";
    default:
      return "";
  }
}

export function filterSectorItems(items, sectorId, inRange) {
  if (!items?.length) return [];
  if (sectorId === "fleet" || sectorId === "customers" || sectorId === "suppliers") {
    return items;
  }
  return items.filter((item) => inRange(getSectorDateValue(item, sectorId)));
}

export function buildSectorRows(sectorId, items, labels = {}) {
  switch (sectorId) {
    case "billing":
      return items.map((item) => ({
        [labels.invoice || "Invoice"]: item.invoiceNumber || item.id,
        [labels.customer || "Customer"]: item.customer,
        [labels.issueDate || "Issued"]: item.date || "",
        [labels.dueDate || "Due"]: item.dueDate || "",
        [labels.total || "Total"]: moneyValue(item.total),
        [labels.paid || "Paid"]: moneyValue(item.paid),
        [labels.balance || "Balance"]: Math.max(0, moneyValue(item.total) - moneyValue(item.paid)),
        [labels.status || "Status"]: item.status || "",
      }));
    case "shipments":
      return items.map((item) => ({
        [labels.code || "Code"]: item.id || item.shipmentCode || "",
        [labels.customer || "Customer"]: item.customer || "",
        [labels.origin || "Origin"]: item.origin || "",
        [labels.destination || "Destination"]: item.destination || "",
        [labels.vehicle || "Vehicle"]: item.vehicle || "",
        [labels.quantity || "Quantity"]: `${item.quantity ?? ""} ${item.unit ?? ""}`.trim(),
        [labels.date || "Date"]: item.date || "",
        [labels.status || "Status"]: item.status || "",
      }));
    case "deliveries":
      return items.map((item) => ({
        [labels.date || "Date"]: item.date || "",
        [labels.origin || "Origin"]: item.origin || "",
        [labels.destination || "Destination"]: `${item.customer || ""} - ${item.destination || ""}`.trim(),
        [labels.vehicle || "Vehicle"]: item.vehicle || "",
        [labels.quantity || "Quantity"]: `${item.quantity ?? ""} ${item.unit ?? ""}`.trim(),
        [labels.status || "Status"]: item.status || "",
      }));
    case "fleet":
      return items.map((item) => ({
        [labels.plate || "Plate"]: item.headPlate || item.plate || item.id,
        [labels.trailer || "Trailer"]: item.trailerPlate || "",
        [labels.driver || "Driver"]: item.driver || "",
        [labels.phone || "Phone"]: item.driverPhone || "",
        [labels.status || "Status"]: item.status || "",
        [labels.ownership || "Ownership"]: item.ownership || "",
      }));
    case "customers":
      return items.map((item) => ({
        [labels.id || "ID"]: item.id || "",
        [labels.name || "Name"]: item.name || "",
        [labels.phone || "Phone"]: item.phone || "",
        [labels.location || "Location"]: item.location || "",
      }));
    case "suppliers":
      return items.map((item) => ({
        [labels.id || "ID"]: item.id || "",
        [labels.name || "Name"]: item.name || "",
        [labels.phone || "Phone"]: item.phone || "",
        [labels.location || "Location"]: item.location || "",
        [labels.buyingPrice || "Buying"]: item.buyingPrice ?? "",
        [labels.sellingPrice || "Selling"]: item.sellingPrice ?? "",
      }));
    case "maintenance":
      return items.map((item) => ({
        [labels.vehicle || "Vehicle"]: item.vehicleLabel || "",
        [labels.plate || "Plate"]: item.plateNumber || "",
        [labels.date || "Date"]: item.serviceDate || "",
        [labels.type || "Type"]: item.maintenanceType || "",
        [labels.workshop || "Workshop"]: item.workshop || "",
        [labels.mechanic || "Mechanic"]: item.mechanic || "",
        [labels.cost || "Cost"]: moneyValue(item.totalCost),
        [labels.status || "Status"]: item.status || "",
      }));
    default:
      return [];
  }
}

export function buildSectorSummary(sectorId, items) {
  if (sectorId === "billing") {
    const total = items.reduce((sum, item) => sum + moneyValue(item.total), 0);
    const paid = items.reduce((sum, item) => sum + moneyValue(item.paid), 0);
    const outstanding = items.reduce(
      (sum, item) => sum + Math.max(0, moneyValue(item.total) - moneyValue(item.paid)),
      0,
    );
    return [
      { labelKey: "records", value: String(items.length) },
      { labelKey: "invoiced", value: formatReceiptMoney(total) },
      { labelKey: "collected", value: formatReceiptMoney(paid) },
      { labelKey: "outstanding", value: formatReceiptMoney(outstanding) },
    ];
  }

  if (sectorId === "shipments" || sectorId === "deliveries") {
    const delivered = items.filter((item) => item.status === "delivered").length;
    const transit = items.filter((item) => item.status === "transit").length;
    const pending = items.filter((item) => item.status === "pending").length;
    return [
      { labelKey: "records", value: String(items.length) },
      { labelKey: "delivered", value: String(delivered) },
      { labelKey: "inTransit", value: String(transit) },
      { labelKey: "pending", value: String(pending) },
    ];
  }

  if (sectorId === "fleet") {
    const active = items.filter((item) => item.status === "active").length;
    return [
      { labelKey: "records", value: String(items.length) },
      { labelKey: "active", value: String(active) },
      { labelKey: "other", value: String(items.length - active) },
    ];
  }

  if (sectorId === "maintenance") {
    const cost = items.reduce((sum, item) => sum + moneyValue(item.totalCost), 0);
    return [
      { labelKey: "records", value: String(items.length) },
      { labelKey: "totalCost", value: formatReceiptMoney(cost) },
    ];
  }

  return [{ labelKey: "records", value: String(items.length) }];
}

function periodLabel(filter, labels, customRange = {}) {
  if (filter === "today") return labels.today;
  if (filter === "yesterday") return labels.yesterday;
  if (filter === "week") return labels.thisWeek;
  if (filter === "month") return labels.thisMonth;
  if (filter === "custom") {
    const from = customRange.from || "…";
    const to = customRange.to || "…";
    return `${from} → ${to}`;
  }
  return labels.all || "All";
}

export function buildReportCsv({ sectorId, items, labels, sectorLabel }) {
  const rows = buildSectorRows(sectorId, items, labels.column || labels);
  const headers = rows[0] ? Object.keys(rows[0]) : ["Message"];
  const body = rows.length ? rows : [{ [headers[0]]: labels.noRecords || "No records" }];
  const csv = rowsToCsv(headers, body);
  const stamp = new Date().toISOString().slice(0, 10);
  const safeSector = String(sectorLabel || sectorId).replace(/\s+/g, "-").toLowerCase();
  return {
    blob: new Blob([csv], { type: "text/csv;charset=utf-8" }),
    fileName: `${safeSector}-report-${stamp}.csv`,
  };
}

export function buildReportPdf({
  sectorId,
  items,
  labels,
  sectorLabel,
  business,
  filter,
  customRange,
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = 42;

  const company = business?.companyName || business?.name || "LogisticsFlow";
  const businessId = business?.businessId || "";
  const rows = buildSectorRows(sectorId, items, labels.column || labels);
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  const summary = buildSectorSummary(sectorId, items);
  const period = periodLabel(filter, labels, customRange);

  doc.setFillColor(79, 124, 255);
  doc.rect(0, 0, pageWidth, 8, "F");
  doc.setFillColor(47, 91, 255);
  doc.rect(pageWidth * 0.4, 0, pageWidth * 0.6, 8, "F");

  doc.setFillColor(79, 124, 255);
  doc.roundedRect(margin, y, 34, 34, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("LF", margin + 17, y + 21, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.text(company, margin + 46, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(businessId ? `ID ${businessId}` : "LogisticsFlow", margin + 46, y + 28);

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(pageWidth - margin - 120, y + 4, 120, 24, 12, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(47, 91, 255);
  doc.text(labels.reportBadge || "REPORT", pageWidth - margin - 60, y + 19, { align: "center" });

  y += 56;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(String(sectorLabel || sectorId), margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`${labels.period || "Period"}: ${period}`, margin, y);
  y += 14;
  doc.text(`${labels.generated || "Generated"}: ${new Date().toLocaleString()}`, margin, y);

  y += 24;
  const cardWidth = (contentWidth - 12 * (Math.min(summary.length, 4) - 1)) / Math.min(summary.length, 4);
  summary.slice(0, 4).forEach((item, index) => {
    const x = margin + index * (cardWidth + 12);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, 52, 10, 10, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const label = labels.summary?.[item.labelKey] || item.labelKey;
    doc.text(String(label).toUpperCase(), x + 12, y + 18);
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(String(item.value), x + 12, y + 38);
  });

  y += 72;
  if (!headers.length || !rows.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(labels.noRecords || "No records for this period.", margin, y);
  } else {
    const colCount = Math.min(headers.length, 6);
    const visibleHeaders = headers.slice(0, colCount);
    const colWidth = contentWidth / colCount;

    const drawHeader = () => {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 22, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      visibleHeaders.forEach((header, index) => {
        doc.text(String(header).toUpperCase(), margin + index * colWidth + 6, y + 14, {
          maxWidth: colWidth - 10,
        });
      });
      y += 26;
    };

    drawHeader();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    rows.forEach((row, rowIndex) => {
      if (y > pageHeight - 56) {
        doc.addPage();
        y = 48;
        drawHeader();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
      }
      if (rowIndex % 2 === 1) {
        doc.setFillColor(252, 253, 255);
        doc.rect(margin, y - 10, contentWidth, 18, "F");
      }
      doc.setTextColor(15, 23, 42);
      visibleHeaders.forEach((header, index) => {
        const value = String(row[header] ?? "");
        doc.text(value.slice(0, 28), margin + index * colWidth + 6, y, {
          maxWidth: colWidth - 10,
        });
      });
      y += 18;
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${labels.poweredBy || "Powered by LogisticsFlow"} · ${sectorLabel}`,
    pageWidth / 2,
    pageHeight - 24,
    { align: "center" },
  );

  doc.setProperties({ title: `${sectorLabel} Report` });
  const stamp = new Date().toISOString().slice(0, 10);
  const safeSector = String(sectorLabel || sectorId).replace(/\s+/g, "-").toLowerCase();
  return {
    blob: doc.output("blob"),
    fileName: `${safeSector}-report-${stamp}.pdf`,
  };
}

export function downloadReportFile(file) {
  downloadFileBlob(file.fileName, file.blob);
}
