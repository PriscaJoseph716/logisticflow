import { jsPDF } from "jspdf";

export function moneyValue(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatReceiptMoney(value) {
  return `TSh ${Number(moneyValue(value)).toLocaleString("en-TZ")}`;
}

export function formatPaymentMethodLabel(method, labels = {}) {
  const key = String(method || "").toUpperCase();
  if (key === "BANK_TRANSFER") return labels.methodBank || "Bank transfer";
  if (key === "CASH") return labels.methodCash || "Cash";
  if (key === "MOBILE_MONEY" || key === "MPESA") return labels.methodMobile || "Mobile money";
  if (key === "CARD") return labels.methodCard || "Card";
  return String(method || "—").replaceAll("_", " ");
}

function formatPaidAtLabel(paidAt) {
  const stamp = paidAt instanceof Date ? paidAt : new Date(paidAt || Date.now());
  if (Number.isNaN(stamp.getTime())) return "—";
  return stamp.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function receiptIdFromPayment(paymentId) {
  const compact = String(paymentId || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  return `RCP-${(compact || Date.now().toString()).slice(0, 8)}`;
}

export function invoiceBalance(invoice) {
  return Math.max(0, moneyValue(invoice?.total) - moneyValue(invoice?.paid));
}

export function buildPaymentReceipt({
  invoice,
  amountPaid,
  business,
  method = "BANK_TRANSFER",
  paidAt = new Date(),
  paymentId = null,
  previouslyPaidOverride = null,
}) {
  const total = moneyValue(invoice.total);
  const previouslyPaid =
    previouslyPaidOverride == null ? moneyValue(invoice.paid) : moneyValue(previouslyPaidOverride);
  const paidNow = moneyValue(amountPaid);
  const paid = previouslyPaid + paidNow;
  const balance = Math.max(0, total - paid);
  const stamp = paidAt instanceof Date ? paidAt : new Date(paidAt);

  return {
    kind: "receipt",
    id: paymentId ? receiptIdFromPayment(paymentId) : `RCP-${Date.now().toString().slice(-8)}`,
    paymentId: paymentId || null,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber ?? invoice.id,
    customer: invoice.customer ?? "Customer",
    customerId: invoice.customerId ?? "",
    companyName: business?.companyName || business?.name || "LogisticsFlow",
    businessId: business?.businessId || "",
    issueDate: invoice.date ?? "",
    dueDate: invoice.dueDate ?? "",
    method,
    paidAt: stamp.toISOString(),
    paidAtLabel: formatPaidAtLabel(stamp),
    amountPaid: paidNow,
    previouslyPaid,
    total,
    paid,
    balance,
    status: balance <= 0 ? "paid" : "partial",
  };
}

export function buildReceiptFromInvoice(invoice, business, payment = null) {
  const records = invoice?.paymentRecords ?? [];
  const selected = payment || records[0];

  if (selected) {
    const paidNow = moneyValue(selected.amount);
    const currentPaid = moneyValue(invoice.paid);
    const previouslyPaid = Math.max(0, currentPaid - paidNow);

    return buildPaymentReceipt({
      invoice,
      amountPaid: paidNow,
      business,
      method: selected.method || "BANK_TRANSFER",
      paidAt: selected.paidAt || new Date(),
      paymentId: selected.id,
      previouslyPaidOverride: previouslyPaid,
    });
  }

  if (moneyValue(invoice?.paid) <= 0) return null;

  return buildPaymentReceipt({
    invoice,
    amountPaid: moneyValue(invoice.paid),
    business,
    method: "BANK_TRANSFER",
    paidAt: invoice.date || new Date(),
    paymentId: invoice.id,
    previouslyPaidOverride: 0,
  });
}

export function buildBillDocument(invoice, business) {
  const total = moneyValue(invoice.total);
  const paid = moneyValue(invoice.paid);
  const balance = Math.max(0, total - paid);
  const status =
    balance <= 0 || invoice.status === "paid"
      ? "paid"
      : invoice.status === "overdue" || invoice.status === "partial"
        ? invoice.status
        : paid > 0
          ? "partial"
          : "open";

  return {
    kind: "bill",
    id: invoice.invoiceNumber || invoice.id,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber ?? invoice.id,
    customer: invoice.customer ?? "Customer",
    customerId: invoice.customerId ?? "",
    companyName: business?.companyName || business?.name || "LogisticsFlow",
    businessId: business?.businessId || "",
    issueDate: invoice.date || "—",
    dueDate: invoice.dueDate || "—",
    total,
    paid,
    balance,
    status,
  };
}

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

function drawBillingPdf(doc, documentData, labels, options = {}) {
  const isReceipt = documentData.kind === "receipt";
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = 42;

  doc.setFillColor(79, 124, 255);
  doc.rect(0, 0, pageWidth, 8, "F");
  doc.setFillColor(47, 91, 255);
  doc.rect(pageWidth * 0.45, 0, pageWidth * 0.55, 8, "F");

  doc.setFillColor(79, 124, 255);
  doc.roundedRect(margin, y, 34, 34, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("LF", margin + 17, y + 21, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.text(String(documentData.companyName || "LogisticsFlow"), margin + 46, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    documentData.businessId ? `ID ${documentData.businessId}` : "LogisticsFlow",
    margin + 46,
    y + 28,
  );

  const statusText = isReceipt
    ? documentData.status === "paid"
      ? labels.paymentSuccessful
      : labels.paymentPartial
    : documentData.status === "paid"
      ? labels.statusPaid
      : documentData.status === "partial"
        ? labels.statusPartial
        : documentData.status === "overdue"
          ? labels.statusOverdue
          : labels.statusOpen;

  const badgeColor =
    documentData.status === "paid"
      ? [5, 150, 105]
      : documentData.status === "partial" || documentData.status === "overdue"
        ? [217, 119, 6]
        : [79, 124, 255];
  const badgeBg =
    documentData.status === "paid"
      ? [236, 253, 245]
      : documentData.status === "partial" || documentData.status === "overdue"
        ? [255, 251, 235]
        : [239, 246, 255];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const badgeWidth = Math.min(180, doc.getTextWidth(statusText) + 20);
  doc.setFillColor(...badgeBg);
  doc.roundedRect(pageWidth - margin - badgeWidth, y + 4, badgeWidth, 22, 11, 11, "F");
  doc.setTextColor(...badgeColor);
  doc.text(statusText, pageWidth - margin - badgeWidth / 2, y + 18, { align: "center" });

  y += 56;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(232, 238, 252);
  doc.roundedRect(margin, y, contentWidth, 72, 12, 12, "FD");
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(
    (isReceipt ? labels.amountPaidLabel : labels.amountDue).toUpperCase(),
    margin + 18,
    y + 22,
  );
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(24);
  const heroAmount = isReceipt
    ? formatReceiptMoney(documentData.amountPaid)
    : formatReceiptMoney(documentData.balance > 0 ? documentData.balance : documentData.total);
  doc.text(heroAmount, margin + 18, y + 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    isReceipt
      ? `${labels.paidOn} ${documentData.paidAtLabel}`
      : `${labels.issueDate}: ${documentData.issueDate || "—"}`,
    margin + 18,
    y + 62,
  );

  y += 96;
  const meta = isReceipt
    ? [
        [labels.receiptNumber, documentData.id],
        [labels.invoice, documentData.invoiceNumber],
        [labels.method, formatPaymentMethodLabel(documentData.method, labels)],
        [
          labels.status,
          documentData.status === "paid" ? labels.statusPaid : labels.statusPartial,
        ],
      ]
    : [
        [labels.invoice, documentData.invoiceNumber],
        [labels.issueDate, documentData.issueDate || "—"],
        [labels.dueDate, documentData.dueDate || "—"],
        [
          labels.status,
          documentData.status === "paid"
            ? labels.statusPaid
            : documentData.status === "partial"
              ? labels.statusPartial
              : documentData.status === "overdue"
                ? labels.statusOverdue
                : labels.statusOpen,
        ],
      ];

  meta.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * (contentWidth / 2);
    const yy = y + row * 34;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(String(label).toUpperCase(), x, yy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(String(value || "—"), x, yy + 14);
  });

  y += 78;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 54, 10, 10, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(labels.billedTo.toUpperCase(), margin + 14, y + 16);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(String(documentData.customer || "—"), margin + 14, y + 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(labels.customer, margin + 14, y + 46);

  y += 70;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 24, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 52);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(labels.description.toUpperCase(), margin + 12, y + 15);
  doc.text(
    (isReceipt ? labels.thisPayment : labels.total).toUpperCase(),
    pageWidth - margin - 12,
    y + 15,
    { align: "right" },
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const lineLabel = isReceipt
    ? `${labels.serviceLine} ${documentData.invoiceNumber}`
    : `${labels.billServiceLine} ${documentData.invoiceNumber}`;
  doc.text(lineLabel, margin + 12, y + 40);
  doc.setFont("helvetica", "bold");
  doc.text(
    isReceipt
      ? formatReceiptMoney(documentData.amountPaid)
      : formatReceiptMoney(documentData.total),
    pageWidth - margin - 12,
    y + 40,
    { align: "right" },
  );

  y += 78;
  const totals = [
    [labels.invoiceTotal, formatReceiptMoney(documentData.total)],
    [labels.paid, formatReceiptMoney(documentData.paid)],
    [labels.remainingBalance, formatReceiptMoney(documentData.balance)],
  ];
  totals.forEach(([label, value], index) => {
    const yy = y + index * 18;
    const isGrand = index === totals.length - 1;
    doc.setFont("helvetica", isGrand ? "bold" : "normal");
    doc.setFontSize(isGrand ? 11 : 10);
    doc.setTextColor(isGrand ? 15 : 100, isGrand ? 23 : 116, isGrand ? 42 : 139);
    doc.text(label, pageWidth - margin - 210, yy);
    doc.setTextColor(15, 23, 42);
    doc.text(value, pageWidth - margin, yy, { align: "right" });
  });

  y += 72;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 42, 10, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(labels.thankYou, margin + 14, y + 25);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${labels.poweredBy} · ${documentData.id}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 28,
    { align: "center" },
  );

  if (options.title) {
    doc.setProperties({ title: options.title });
  }
}

export function buildDocumentPdfBlob(documentData, labels) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const title =
    documentData.kind === "receipt"
      ? `${labels.receiptTitle} ${documentData.id}`
      : `${labels.billTitle} ${documentData.invoiceNumber}`;
  drawBillingPdf(doc, documentData, labels, { title });
  return doc.output("blob");
}

export function downloadBillingDocument(documentData, labels) {
  const blob = buildDocumentPdfBlob(documentData, labels);
  const fileName =
    documentData.kind === "receipt"
      ? `${documentData.id}.pdf`
      : `Bill-${documentData.invoiceNumber || documentData.id}.pdf`;
  downloadFileBlob(fileName, blob);
  return fileName;
}

export async function shareBillingDocument(documentData, labels) {
  const blob = buildDocumentPdfBlob(documentData, labels);
  const fileName =
    documentData.kind === "receipt"
      ? `${documentData.id}.pdf`
      : `Bill-${documentData.invoiceNumber || documentData.id}.pdf`;
  const file = new File([blob], fileName, { type: "application/pdf" });
  const amount =
    documentData.kind === "receipt"
      ? formatReceiptMoney(documentData.amountPaid)
      : formatReceiptMoney(documentData.balance > 0 ? documentData.balance : documentData.total);
  const title =
    documentData.kind === "receipt"
      ? `${labels.receiptTitle} ${documentData.id}`
      : `${labels.billTitle} ${documentData.invoiceNumber}`;
  const summary = `${title}\n${documentData.customer}\n${amount}`;

  if (navigator.share) {
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text: summary, files: [file] });
        return "shared";
      }
      await navigator.share({ title, text: summary });
      downloadFileBlob(fileName, blob);
      return "shared-text";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
    }
  }

  downloadFileBlob(fileName, blob);
  return "downloaded";
}
