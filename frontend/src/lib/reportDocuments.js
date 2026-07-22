import { jsPDF } from "jspdf";
import { formatReceiptMoney, moneyValue } from "./billingDocuments.js";

const ACCENT = [47, 91, 255];
const ACCENT_SOFT = [79, 124, 255];
const SLATE = [15, 23, 42];
const MUTED = [100, 116, 139];
const BORDER = [226, 232, 240];
const ROW_ALT = [248, 250, 252];
const WHITE = [255, 255, 255];
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export function isUuid(value) {
  return UUID_RE.test(String(value ?? "").trim());
}

export function sanitizeDisplayValue(value, fallback = "—") {
  if (value == null) return fallback;
  const text = String(value).trim();
  if (!text || text === "—" || isUuid(text)) return fallback;
  return text;
}

export function formatBusinessNumber(prefix, index) {
  const n = Math.max(0, Number(index) || 0) + 1;
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

export function toReadableCode(value, prefix, index) {
  const text = sanitizeDisplayValue(value, "");
  if (!text) return formatBusinessNumber(prefix, index);

  const prefixed = new RegExp(`^${prefix}P?-(\\d+)$`, "i");
  const match = text.match(prefixed);
  if (match) return `${prefix}-${String(Number(match[1])).padStart(4, "0")}`;

  if (/^[A-Z]{1,4}-\d+$/i.test(text)) {
    const parts = text.toUpperCase().split("-");
    return `${parts[0]}-${String(Number(parts[1])).padStart(4, "0")}`;
  }

  if (!isUuid(text) && text.length <= 24) return text;
  return formatBusinessNumber(prefix, index);
}

function quantityLabel(item) {
  const qty = item.quantity ?? item.quantityTons ?? "";
  const unit = item.unit ? ` ${item.unit}` : "";
  if (qty === "" || qty == null) return "—";
  return `${qty}${unit}`.trim();
}

function formatStatusLabel(status, labels = {}) {
  const key = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  const map = {
    delivered: labels.delivered,
    transit: labels.inTransit,
    intransit: labels.inTransit,
    pending: labels.pending,
    paid: labels.paid,
    partial: labels.partial,
    overdue: labels.overdue,
    inprogress: labels.inProgress,
    active: labels.active,
    open: labels.open || "Open",
    completed: labels.delivered || labels.completed || "Completed",
    scheduled: labels.pending,
  };
  return sanitizeDisplayValue(map[key] || status, "—");
}

function col(key, label, align = "left", widthWeight = 1) {
  return { key, label, align, widthWeight };
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

/**
 * Structured table definition shared by preview rows, CSV, and PDF.
 * Returns { columns, rows } where each row is an array of cell values aligned to columns.
 */
export function buildSectorTable(sectorId, items, labels = {}) {
  const L = labels;

  switch (sectorId) {
    case "billing": {
      const columns = [
        col("index", "#", "center", 0.45),
        col("invoice", L.invoice || "Invoice", "left", 1.1),
        col("customer", L.customer || "Customer", "left", 1.4),
        col("issueDate", L.issueDate || "Issued", "left", 1),
        col("dueDate", L.dueDate || "Due", "left", 1),
        col("total", L.total || "Total", "right", 1),
        col("paid", L.paid || "Paid", "right", 1),
        col("balance", L.balance || "Balance", "right", 1),
        col("status", L.status || "Status", "center", 0.9),
      ];
      const rows = items.map((item, index) => {
        const total = moneyValue(item.total);
        const paid = moneyValue(item.paid);
        const balance = Math.max(0, total - paid);
        return [
          String(index + 1),
          toReadableCode(item.invoiceNumber, "INV", index),
          sanitizeDisplayValue(item.customer),
          sanitizeDisplayValue(item.date || "", "—"),
          sanitizeDisplayValue(item.dueDate || "", "—"),
          formatReceiptMoney(total),
          formatReceiptMoney(paid),
          formatReceiptMoney(balance),
          formatStatusLabel(item.status, L),
        ];
      });
      return { columns, rows };
    }

    case "shipments": {
      const columns = [
        col("index", "#", "center", 0.4),
        col("shipmentNo", L.shipmentNo || "Shipment No", "left", 1.1),
        col("customer", L.customer || "Customer", "left", 1.3),
        col("vehicle", L.vehicle || "Vehicle", "left", 1),
        col("driver", L.driver || "Driver", "left", 1.1),
        col("origin", L.origin || "Origin", "left", 1.1),
        col("destination", L.destination || "Destination", "left", 1.1),
        col("quantity", L.quantity || "Quantity", "right", 0.9),
        col("status", L.status || "Status", "center", 0.9),
        col("date", L.date || "Date", "center", 0.9),
      ];
      const rows = items.map((item, index) => [
        String(index + 1),
        toReadableCode(item.shipmentCode, "SH", index),
        sanitizeDisplayValue(item.customer),
        sanitizeDisplayValue(item.vehicle),
        sanitizeDisplayValue(item.driver, "Unassigned"),
        sanitizeDisplayValue(item.origin),
        sanitizeDisplayValue(item.destination),
        quantityLabel(item),
        formatStatusLabel(item.status, L),
        sanitizeDisplayValue(item.date || "", "—"),
      ]);
      return { columns, rows };
    }

    case "deliveries": {
      const columns = [
        col("index", "#", "center", 0.4),
        col("deliveryNo", L.deliveryNo || "Delivery No", "left", 1.1),
        col("customer", L.customer || "Customer", "left", 1.2),
        col("origin", L.origin || "Origin", "left", 1.1),
        col("destination", L.destination || "Destination", "left", 1.2),
        col("vehicle", L.vehicle || "Vehicle", "left", 1),
        col("quantity", L.quantity || "Quantity", "right", 0.9),
        col("status", L.status || "Status", "center", 0.9),
        col("date", L.date || "Date", "left", 0.9),
      ];
      const rows = items.map((item, index) => [
        String(index + 1),
        toReadableCode(item.deliveryCode, "DL", index),
        sanitizeDisplayValue(item.customer),
        sanitizeDisplayValue(item.origin),
        sanitizeDisplayValue(item.destination),
        sanitizeDisplayValue(item.vehicle),
        quantityLabel(item),
        formatStatusLabel(item.status, L),
        sanitizeDisplayValue(item.date || "", "—"),
      ]);
      return { columns, rows };
    }

    case "fleet": {
      const columns = [
        col("index", "#", "center", 0.4),
        col("vehicleNo", L.vehicleNo || "Vehicle No", "left", 1),
        col("plate", L.plate || "Plate", "left", 1.1),
        col("trailer", L.trailer || "Trailer", "left", 1),
        col("driver", L.driver || "Driver", "left", 1.2),
        col("phone", L.phone || "Phone", "left", 1.1),
        col("status", L.status || "Status", "center", 0.9),
        col("ownership", L.ownership || "Ownership", "left", 1),
      ];
      const rows = items.map((item, index) => [
        String(index + 1),
        toReadableCode(item.vehicleCode || item.fleetCode, "VH", index),
        sanitizeDisplayValue(item.headPlate || item.plate),
        sanitizeDisplayValue(item.trailerPlate || "", "—"),
        sanitizeDisplayValue(item.driver, "Unassigned"),
        sanitizeDisplayValue(item.driverPhone || "", "—"),
        formatStatusLabel(item.status, L),
        sanitizeDisplayValue(item.ownership || "", "—"),
      ]);
      return { columns, rows };
    }

    case "customers": {
      const columns = [
        col("index", "#", "center", 0.45),
        col("name", L.name || "Name", "left", 1.6),
        col("phone", L.phone || "Phone", "left", 1.2),
        col("location", L.location || "Location", "left", 1.6),
      ];
      const rows = items.map((item, index) => [
        String(index + 1),
        sanitizeDisplayValue(item.name),
        sanitizeDisplayValue(item.phone || "", "—"),
        sanitizeDisplayValue(item.location || "", "—"),
      ]);
      return { columns, rows };
    }

    case "suppliers": {
      const columns = [
        col("index", "#", "center", 0.4),
        col("supplierNo", L.supplierNo || "Supplier No", "left", 1.1),
        col("name", L.name || "Name", "left", 1.4),
        col("phone", L.phone || "Phone", "left", 1.1),
        col("location", L.location || "Location", "left", 1.3),
        col("buyingPrice", L.buyingPrice || "Buying", "right", 1),
        col("sellingPrice", L.sellingPrice || "Selling", "right", 1),
      ];
      const rows = items.map((item, index) => [
        String(index + 1),
        toReadableCode(item.code || item.supplierCode, "SP", index),
        sanitizeDisplayValue(item.name),
        sanitizeDisplayValue(item.phone || "", "—"),
        sanitizeDisplayValue(item.location || "", "—"),
        item.buyingPrice != null && item.buyingPrice !== ""
          ? formatReceiptMoney(item.buyingPrice)
          : "—",
        item.sellingPrice != null && item.sellingPrice !== ""
          ? formatReceiptMoney(item.sellingPrice)
          : "—",
      ]);
      return { columns, rows };
    }

    case "maintenance": {
      const columns = [
        col("index", "#", "center", 0.4),
        col("recordNo", L.recordNo || "Record No", "left", 1),
        col("vehicle", L.vehicle || "Vehicle", "left", 1.2),
        col("plate", L.plate || "Plate", "left", 0.9),
        col("date", L.date || "Date", "left", 0.9),
        col("type", L.type || "Type", "left", 1),
        col("workshop", L.workshop || "Workshop", "left", 1.1),
        col("mechanic", L.mechanic || "Mechanic", "left", 1),
        col("cost", L.cost || "Cost", "right", 0.9),
        col("status", L.status || "Status", "center", 0.9),
      ];
      const rows = items.map((item, index) => [
        String(index + 1),
        toReadableCode(item.maintenanceCode || item.recordCode, "MT", index),
        sanitizeDisplayValue(item.vehicleLabel || item.vehicle),
        sanitizeDisplayValue(item.plateNumber || item.plate || "", "—"),
        sanitizeDisplayValue(item.serviceDate || "", "—"),
        sanitizeDisplayValue(item.maintenanceType || "", "—"),
        sanitizeDisplayValue(item.workshop || "", "—"),
        sanitizeDisplayValue(item.mechanic || "", "—"),
        formatReceiptMoney(item.totalCost),
        formatStatusLabel(item.status, L),
      ]);
      return { columns, rows };
    }

    default:
      return { columns: [], rows: [] };
  }
}

export function buildSectorRows(sectorId, items, labels = {}) {
  const table = buildSectorTable(sectorId, items, labels);
  return table.rows.map((cells) => {
    const row = {};
    table.columns.forEach((column, index) => {
      row[column.label] = cells[index];
    });
    return row;
  });
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

  if (sectorId === "shipments") {
    const delivered = items.filter((item) => item.status === "delivered").length;
    const transit = items.filter((item) => item.status === "transit").length;
    const pending = items.filter((item) => item.status === "pending").length;
    const totalQuantity = items.reduce((sum, item) => sum + moneyValue(item.quantity), 0);
    return [
      { labelKey: "totalShipments", value: String(items.length) },
      { labelKey: "delivered", value: String(delivered) },
      { labelKey: "inTransit", value: String(transit) },
      { labelKey: "pending", value: String(pending) },
      { labelKey: "totalQuantity", value: `${totalQuantity.toLocaleString()} bags` },
    ];
  }

  if (sectorId === "deliveries") {
    const delivered = items.filter((item) => item.status === "delivered").length;
    const transit = items.filter((item) => item.status === "transit").length;
    const pending = items.filter((item) => item.status === "pending").length;
    const totalQuantity = items.reduce((sum, item) => sum + moneyValue(item.quantity), 0);
    return [
      { labelKey: "totalShipments", value: String(items.length) },
      { labelKey: "delivered", value: String(delivered) },
      { labelKey: "inTransit", value: String(transit) },
      { labelKey: "pending", value: String(pending) },
      { labelKey: "totalQuantity", value: `${totalQuantity.toLocaleString()} bags` },
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

function fitText(doc, text, maxWidth) {
  const value = sanitizeDisplayValue(text, "—");
  if (doc.getTextWidth(value) <= maxWidth) return value;
  const ellipsis = "…";
  let low = 0;
  let high = value.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const candidate = `${value.slice(0, mid)}${ellipsis}`;
    if (doc.getTextWidth(candidate) <= maxWidth) low = mid;
    else high = mid - 1;
  }
  return low <= 0 ? ellipsis : `${value.slice(0, low)}${ellipsis}`;
}

function computeColumnWidths(columns, contentWidth) {
  const totalWeight = columns.reduce((sum, column) => sum + (column.widthWeight || 1), 0);
  return columns.map((column) => (contentWidth * (column.widthWeight || 1)) / totalWeight);
}

function drawFooter(doc, {
  pageWidth,
  pageHeight,
  margin,
  labels,
  summaryLine,
  pageIndex,
  pageCount,
}) {
  const website = labels.companyWebsite || "logisticsflow.app";
  const pageLabel = `${labels.page || "Page"} ${pageIndex} ${labels.of || "of"} ${pageCount}`;
  const left = summaryLine || `${labels.records || "Total Records"}`;
  const center = `${labels.poweredBy || "Generated by LogisticsFlow"} · ${website}`;

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.6);
  doc.line(margin, pageHeight - 38, pageWidth - margin, pageHeight - 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(fitText(doc, left, pageWidth * 0.34), margin, pageHeight - 22);
  doc.text(center, pageWidth / 2, pageHeight - 22, { align: "center" });
  doc.text(pageLabel, pageWidth - margin, pageHeight - 22, { align: "right" });
}

export function buildReportCsv({ sectorId, items, labels, sectorLabel }) {
  const columnLabels = labels.column || labels;
  const rows = buildSectorRows(sectorId, items, { ...labels, ...columnLabels });
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
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  const columnLabels = labels.column || labels;
  const tableLabels = { ...labels, ...columnLabels };
  const table = buildSectorTable(sectorId, items, tableLabels);
  const summary = buildSectorSummary(sectorId, items);
  const period = periodLabel(filter, labels, customRange);
  const company = business?.companyName || business?.name || "LogisticsFlow";
  const businessId = business?.businessId || "";
  const generatedAt = new Date().toLocaleString();
  const colWidths = computeColumnWidths(table.columns, contentWidth);
  const rowHeight = 22;
  const headerHeight = 26;

  const footerKeys =
    sectorId === "shipments" || sectorId === "deliveries"
      ? ["totalShipments", "totalQuantity"]
      : summary.slice(0, 2).map((item) => item.labelKey);
  const summaryLine = footerKeys
    .map((key) => {
      const item = summary.find((entry) => entry.labelKey === key);
      if (!item) return null;
      const label = labels.summary?.[key] || labels[key] || key;
      return `${label}: ${item.value}`;
    })
    .filter(Boolean)
    .join("   ·   ");

  const drawAccentBar = () => {
    doc.setFillColor(...ACCENT);
    doc.rect(0, 0, pageWidth, 6, "F");
  };

  const drawPageChrome = ({ includeSummary = true } = {}) => {
    let y = 28;
    drawAccentBar();

    doc.setFillColor(...ACCENT_SOFT);
    doc.roundedRect(margin, y, 34, 34, 8, 8, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("LF", margin + 17, y + 21, { align: "center" });

    doc.setTextColor(...SLATE);
    doc.setFontSize(15);
    doc.text(company, margin + 46, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(businessId ? `Business ID ${businessId}` : "LogisticsFlow", margin + 46, y + 28);

    const badgeWidth = 88;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(pageWidth - margin - badgeWidth, y + 5, badgeWidth, 22, 11, 11, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(String(labels.reportBadge || "REPORT").toUpperCase(), pageWidth - margin - badgeWidth / 2, y + 19, {
      align: "center",
    });

    y += 52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(includeSummary ? 20 : 14);
    doc.setTextColor(...SLATE);
    doc.text(String(sectorLabel || sectorId), margin, y);

    y += includeSummary ? 18 : 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(`${labels.period || "Period"}: ${period}`, margin, y);
    if (includeSummary) {
      y += 14;
      doc.text(`${labels.generated || "Generated"}: ${generatedAt}`, margin, y);
    } else {
      doc.text(`${labels.generated || "Generated"}: ${generatedAt}`, pageWidth - margin, y, { align: "right" });
    }

    if (!includeSummary) return y + 18;

    y += 22;
    const cardCount = Math.min(summary.length, 5);
    const gap = 10;
    const cardWidth = (contentWidth - gap * (cardCount - 1)) / Math.max(cardCount, 1);
    summary.slice(0, cardCount).forEach((item, index) => {
      const x = margin + index * (cardWidth + gap);
      doc.setFillColor(...ROW_ALT);
      doc.setDrawColor(...BORDER);
      doc.roundedRect(x, y, cardWidth, 50, 8, 8, "FD");
      doc.setFillColor(...ACCENT);
      doc.rect(x, y + 6, 3, 38, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      const label = labels.summary?.[item.labelKey] || labels[item.labelKey] || item.labelKey;
      doc.text(fitText(doc, String(label).toUpperCase(), cardWidth - 22), x + 14, y + 18);

      doc.setFontSize(13);
      doc.setTextColor(...SLATE);
      doc.text(fitText(doc, String(item.value), cardWidth - 22), x + 14, y + 36);
    });

    return y + 66;
  };

  let y = drawPageChrome({ includeSummary: true });

  const drawTableHeader = () => {
    doc.setFillColor(...ACCENT);
    doc.roundedRect(margin, y, contentWidth, headerHeight, 5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...WHITE);
    let x = margin;
    table.columns.forEach((column, index) => {
      const width = colWidths[index];
      const text = fitText(doc, String(column.label).toUpperCase(), width - 10);
      // Enterprise reports: headers always centered; cell values keep their align.
      doc.text(text, x + width / 2, y + 16, { align: "center" });
      x += width;
    });
    y += headerHeight + 2;
  };

  if (!table.columns.length || !table.rows.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text(labels.noRecords || "No records for this period.", margin, y);
  } else {
    drawTableHeader();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    table.rows.forEach((cells, rowIndex) => {
      if (y > pageHeight - 56) {
        doc.addPage();
        y = drawPageChrome({ includeSummary: false });
        drawTableHeader();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
      }

      if (rowIndex % 2 === 1) {
        doc.setFillColor(...ROW_ALT);
        doc.rect(margin, y, contentWidth, rowHeight, "F");
      }

      doc.setTextColor(...SLATE);
      let x = margin;
      table.columns.forEach((column, index) => {
        const width = colWidths[index];
        const raw = sanitizeDisplayValue(cells[index], "—");
        const text = fitText(doc, raw, width - 10);
        const textX = column.align === "right" ? x + width - 6 : column.align === "center" ? x + width / 2 : x + 6;
        doc.text(text, textX, y + 12, { align: column.align === "left" ? "left" : column.align });
        x += width;
      });
      y += rowHeight;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    doc.setPage(pageIndex);
    drawFooter(doc, {
      pageWidth,
      pageHeight,
      margin,
      labels,
      summaryLine,
      pageIndex,
      pageCount,
    });
  }

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

function matchesCustomer(recordCustomerId, recordCustomerName, customer) {
  const entityId = customer?.entityId || customer?.raw?.id || "";
  const code = String(customer?.id || customer?.code || "").trim().toLowerCase();
  const name = String(customer?.name || "").trim().toLowerCase();
  const recordId = String(recordCustomerId || "").trim();
  const recordName = String(recordCustomerName || "").trim().toLowerCase();

  if (entityId && recordId && recordId === entityId) return true;
  if (code && recordId && recordId.toLowerCase() === code) return true;
  if (name && recordName && recordName === name) return true;
  return false;
}

/** Gather shipments, deliveries, and invoices for one customer (no UUIDs exposed). */
export function collectCustomerReportData(customer, appData = {}, inRange) {
  const applyRange = typeof inRange === "function" ? inRange : () => true;

  const shipments = (appData.shipments ?? []).filter(
    (item) =>
      matchesCustomer(item.customerId || item.raw?.customerId, item.customer, customer) &&
      applyRange(item.date),
  );

  const shipmentIds = new Set(shipments.map((item) => item.id).filter(Boolean));

  const deliveries = (appData.deliveries ?? []).filter((item) => {
    const linkedShipmentId = item.raw?.shipmentId || item.raw?.shipment?.id;
    const byCustomer = matchesCustomer(
      item.raw?.customerId || item.raw?.shipment?.customerId,
      item.customer,
      customer,
    );
    const byShipment = linkedShipmentId && shipmentIds.has(linkedShipmentId);
    return (byCustomer || byShipment) && applyRange(item.date);
  });

  const invoices = (appData.payments ?? []).filter(
    (item) =>
      matchesCustomer(item.customerId || item.raw?.customerId, item.customer, customer) &&
      applyRange(item.date || item.dueDate),
  );

  const billed = invoices.reduce((sum, item) => sum + moneyValue(item.total), 0);
  const collected = invoices.reduce((sum, item) => sum + moneyValue(item.paid), 0);
  const outstanding = invoices.reduce(
    (sum, item) => sum + Math.max(0, moneyValue(item.total) - moneyValue(item.paid)),
    0,
  );
  const quantity = shipments.reduce((sum, item) => sum + moneyValue(item.quantity), 0);

  return {
    shipments,
    deliveries,
    invoices,
    summary: {
      shipments: shipments.length,
      deliveries: deliveries.length,
      invoices: invoices.length,
      quantity,
      billed,
      collected,
      outstanding,
    },
  };
}

/**
 * Enterprise PDF for one customer: profile + shipments + deliveries + billing.
 */
export function buildCustomerReportPdf({
  customer,
  appData,
  labels,
  business,
  filter,
  customRange,
  inRange,
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  const rowHeight = 22;
  const headerHeight = 26;
  const tableBottom = pageHeight - 52;

  const company = business?.companyName || business?.name || "LogisticsFlow";
  const businessId = business?.businessId || "";
  const period = periodLabel(filter, labels, customRange);
  const generatedAt = new Date().toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const columnLabels = { ...(labels.column || {}), ...labels };
  const data = collectCustomerReportData(customer, appData, inRange);
  const customerName = sanitizeDisplayValue(customer?.name, "Customer");
  const title = labels.customerReportTitle || "Customer Report";

  const summaryCards = [
    { label: labels.totalShipments || "Shipments", value: String(data.summary.shipments) },
    { label: labels.deliveries || "Deliveries", value: String(data.summary.deliveries) },
    {
      label: labels.totalQuantity || "Quantity",
      value: `${data.summary.quantity.toLocaleString()} bags`,
    },
    { label: labels.invoiced || "Billed", value: formatReceiptMoney(data.summary.billed) },
    { label: labels.outstanding || "Outstanding", value: formatReceiptMoney(data.summary.outstanding) },
  ];

  const sections = [
    {
      key: "shipments",
      title: labels.shipmentsSection || labels.pages?.shipments || "Shipments",
      table: buildSectorTable("shipments", data.shipments, columnLabels),
    },
    {
      key: "deliveries",
      title: labels.deliveriesSection || labels.pages?.deliveries || "Deliveries",
      table: buildSectorTable("deliveries", data.deliveries, columnLabels),
    },
    {
      key: "billing",
      title: labels.billingSection || labels.pages?.billing || "Billing",
      table: buildSectorTable("billing", data.invoices, columnLabels),
    },
  ];

  const summaryLine = [
    `${labels.totalShipments || "Shipments"}: ${data.summary.shipments}`,
    `${labels.outstanding || "Outstanding"}: ${formatReceiptMoney(data.summary.outstanding)}`,
  ].join("   ·   ");

  let y = 28;

  const drawAccentBar = () => {
    doc.setFillColor(...ACCENT);
    doc.rect(0, 0, pageWidth, 6, "F");
  };

  const ensureSpace = (needed) => {
    if (y + needed <= tableBottom) return false;
    doc.addPage();
    y = 40;
    drawAccentBar();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...SLATE);
    doc.text(company, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${title} · ${customerName}`, pageWidth - margin, y, { align: "right" });
    y += 16;
    doc.setDrawColor(...BORDER);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
    return true;
  };

  // Header
  drawAccentBar();
  doc.setFillColor(...ACCENT_SOFT);
  doc.roundedRect(margin, y, 34, 34, 8, 8, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("LF", margin + 17, y + 21, { align: "center" });

  doc.setTextColor(...SLATE);
  doc.setFontSize(15);
  doc.text(company, margin + 46, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(businessId ? `Business ID ${businessId}` : "LogisticsFlow", margin + 46, y + 28);

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(pageWidth - margin - 118, y + 5, 118, 22, 11, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text(String(labels.reportBadge || "REPORT").toUpperCase(), pageWidth - margin - 59, y + 19, {
    align: "center",
  });

  y += 52;
  doc.setDrawColor(...BORDER);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...SLATE);
  doc.text(title, margin, y);
  y += 18;
  doc.setFontSize(13);
  doc.text(customerName, margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const phone = sanitizeDisplayValue(customer?.phone);
  const location = sanitizeDisplayValue(customer?.location);
  doc.text(`${labels.phone || "Phone"}: ${phone}   ·   ${labels.location || "Location"}: ${location}`, margin, y);
  y += 14;
  doc.text(`${labels.period || "Period"}: ${period}`, margin, y);
  y += 14;
  doc.text(`${labels.generated || "Generated"}: ${generatedAt}`, margin, y);
  y += 22;

  // Summary cards
  const cardCount = summaryCards.length;
  const gap = 10;
  const cardW = (contentWidth - gap * (cardCount - 1)) / cardCount;
  const cardH = 52;
  summaryCards.forEach((card, index) => {
    const x = margin + index * (cardW + gap);
    doc.setFillColor(...ROW_ALT);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(x, y, cardW, cardH, 8, 8, "FD");
    doc.setFillColor(...ACCENT);
    doc.rect(x, y + 6, 3, cardH - 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(fitText(doc, String(card.label).toUpperCase(), cardW - 20), x + 12, y + 18);
    doc.setFontSize(12);
    doc.setTextColor(...SLATE);
    doc.text(fitText(doc, String(card.value), cardW - 20), x + 12, y + 38);
  });
  y += cardH + 24;

  const drawSectionTable = (sectionTitle, table) => {
    ensureSpace(56);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...SLATE);
    doc.text(sectionTitle, margin, y);
    y += 14;

    if (!table.columns.length || !table.rows.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(labels.noRecords || "No records for this period.", margin, y);
      y += 20;
      return;
    }

    const colWidths = computeColumnWidths(table.columns, contentWidth);

    const drawHeader = () => {
      doc.setFillColor(...ACCENT);
      doc.roundedRect(margin, y, contentWidth, headerHeight, 5, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...WHITE);
      let x = margin;
      table.columns.forEach((column, index) => {
        const width = colWidths[index];
        doc.text(fitText(doc, String(column.label).toUpperCase(), width - 10), x + width / 2, y + 16, {
          align: "center",
        });
        x += width;
      });
      y += headerHeight + 2;
    };

    drawHeader();
    table.rows.forEach((cells, rowIndex) => {
      if (ensureSpace(rowHeight + 4)) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...SLATE);
        doc.text(`${sectionTitle} (${labels.continued || "continued"})`, margin, y);
        y += 12;
        drawHeader();
      }

      if (rowIndex % 2 === 1) {
        doc.setFillColor(...ROW_ALT);
        doc.rect(margin, y, contentWidth, rowHeight, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SLATE);
      let x = margin;
      table.columns.forEach((column, index) => {
        const width = colWidths[index];
        const text = fitText(doc, sanitizeDisplayValue(cells[index], "—"), width - 10);
        const textX =
          column.align === "right" ? x + width - 6 : column.align === "center" ? x + width / 2 : x + 6;
        doc.text(text, textX, y + 14, {
          align: column.align === "left" ? "left" : column.align,
        });
        x += width;
      });
      y += rowHeight;
    });
    y += 18;
  };

  sections.forEach((section) => {
    drawSectionTable(section.title, section.table);
  });

  const pageCount = doc.getNumberOfPages();
  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    doc.setPage(pageIndex);
    drawFooter(doc, {
      pageWidth,
      pageHeight,
      margin,
      labels,
      summaryLine: `${customerName}   ·   ${summaryLine}`,
      pageIndex,
      pageCount,
    });
  }

  doc.setProperties({ title: `${title} — ${customerName}` });
  const stamp = new Date().toISOString().slice(0, 10);
  const safeName = String(customerName)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "customer";
  return {
    blob: doc.output("blob"),
    fileName: `customer-${safeName}-report-${stamp}.pdf`,
  };
}
