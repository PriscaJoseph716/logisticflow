import { useMemo, useState } from "react";
import {
  ClipboardList,
  FileText,
  ImageIcon,
  Paperclip,
  Plus,
  Receipt,
  Search,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";

export const MAINTENANCE_FORM_TYPE_KEYS = [
  "generalService",
  "oilChange",
  "tyreReplacement",
  "batteryReplacement",
  "brakeService",
  "engineRepair",
  "suspension",
  "electrical",
  "airConditioning",
  "other",
];

export const MAINTENANCE_FORM_STATUS_KEYS = ["pending", "inProgress", "completed"];
export const MAINTENANCE_PRIORITY_KEYS = ["low", "medium", "high"];

export const TYRE_POSITION_KEYS = [
  "frontLeft",
  "frontRight",
  "rearLeft",
  "rearRight",
  "spare",
];

export function createEmptyMaintenancePart() {
  return {
    id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    partName: "",
    partNumber: "",
    brand: "",
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
  };
}

export function createEmptyMaintenanceDetails() {
  return {
    tyrePosition: "",
    tyreSerialNumber: "",
    tyreSize: "",
    tyreManufacturer: "",
    expectedReplacementMileage: "",
    batteryBrand: "",
    batterySerialNumber: "",
    batteryCapacityAh: "",
    batteryWarranty: "",
    oilBrand: "",
    oilGrade: "",
    oilQuantityLitres: "",
    brakePosition: "",
    brakeBrand: "",
  };
}

function moneyValue(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function partsTotal(parts = []) {
  return parts.reduce((sum, part) => {
    const quantity = moneyValue(part.quantity) || 0;
    const unitPrice = moneyValue(part.unitPrice) || 0;
    return sum + (moneyValue(part.totalPrice) || quantity * unitPrice);
  }, 0);
}

function Field({ label, children, hint }) {
  return (
    <label className="maint-field">
      <span className="maint-field-label">{label}</span>
      {children}
      {hint ? <em className="maint-field-hint">{hint}</em> : null}
    </label>
  );
}

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="maint-form-section">
      <div className="maint-form-section-head">
        <div className="maint-form-section-icon">
          <Icon size={16} />
        </div>
        <div>
          <h4>{title}</h4>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="maint-form-section-body">{children}</div>
    </section>
  );
}

export default function MaintenanceFormModal({
  title,
  form,
  setForm,
  vehicleOptions = [],
  labels,
  language = "en",
  formatMoney,
  onClose,
  onSave,
  saveLabel,
  cancelLabel,
  uploading = false,
  onUploadFiles,
  onRemoveFile,
  canChangeStatus = true,
}) {
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const type = form.maintenanceType || "generalService";
  const details = form.details || createEmptyMaintenanceDetails();
  const computedPartsCost = partsTotal(form.parts);
  const laborCost = moneyValue(form.laborCost);
  const otherExpenses = moneyValue(form.otherExpenses);
  const grandTotal = laborCost + computedPartsCost + otherExpenses;

  const filteredVehicles = useMemo(() => {
    const query = vehicleQuery.trim().toLowerCase();
    if (!query) return vehicleOptions;
    return vehicleOptions.filter((vehicle) =>
      [vehicle.label, vehicle.plateNumber, vehicle.id].join(" ").toLowerCase().includes(query),
    );
  }, [vehicleOptions, vehicleQuery]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateDetail = (name, value) => {
    setForm((current) => ({
      ...current,
      details: {
        ...(current.details || createEmptyMaintenanceDetails()),
        [name]: value,
      },
    }));
  };

  const updatePart = (partId, field, value) => {
    setForm((current) => {
      const nextParts = (current.parts ?? []).map((part) => {
        if (part.id !== partId) return part;
        const nextPart = { ...part, [field]: value };
        const quantity = moneyValue(field === "quantity" ? value : nextPart.quantity) || 0;
        const unitPrice = moneyValue(field === "unitPrice" ? value : nextPart.unitPrice) || 0;
        nextPart.totalPrice = quantity * unitPrice;
        return nextPart;
      });
      return {
        ...current,
        parts: nextParts,
        partsCost: partsTotal(nextParts),
      };
    });
  };

  const addPart = () => {
    setForm((current) => ({
      ...current,
      parts: [...(current.parts ?? []), createEmptyMaintenancePart()],
    }));
  };

  const removePart = (partId) => {
    setForm((current) => {
      const nextParts = (current.parts ?? []).filter((part) => part.id !== partId);
      return {
        ...current,
        parts: nextParts.length ? nextParts : [createEmptyMaintenancePart()],
        partsCost: partsTotal(nextParts),
      };
    });
  };

  const handleVehicleChange = (vehicleId) => {
    const vehicle = vehicleOptions.find((item) => item.id === vehicleId);
    setForm((current) => ({
      ...current,
      vehicleId,
      plateNumber: vehicle?.plateNumber || "",
      vehicleLabel: vehicle?.label || "",
    }));
  };

  const handleFiles = (fileList) => {
    if (onUploadFiles) onUploadFiles(fileList);
  };

  const categoryIcon = (category = "") => {
    const key = String(category).toLowerCase();
    if (key.includes("photo") || key.includes("image")) return ImageIcon;
    if (key.includes("receipt")) return Receipt;
    if (key.includes("invoice")) return FileText;
    return Paperclip;
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card glass-elevated modal-card-wide maint-modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="maint-modal-title">
            <div className="maint-form-section-icon">
              <Wrench size={16} />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{labels.formIntro}</p>
            </div>
          </div>
          <button type="button" className="icon-button muted" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body maint-modal-body">
          <Section icon={ClipboardList} title={labels.sectionVehicle} subtitle={labels.sectionVehicleText}>
            <div className="maint-form-grid">
              <Field label={labels.vehicleSearch}>
                <div className="maint-search-wrap">
                  <Search size={14} />
                  <input
                    type="text"
                    value={vehicleQuery}
                    onChange={(event) => setVehicleQuery(event.target.value)}
                    placeholder={labels.vehicleSearchPlaceholder}
                  />
                </div>
              </Field>
              <Field label={labels.vehicle}>
                <select
                  value={form.vehicleId ?? ""}
                  onChange={(event) => handleVehicleChange(event.target.value)}
                >
                  <option value="">{labels.selectVehicle}</option>
                  {filteredVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={labels.plateNumber}>
                <input value={form.plateNumber ?? ""} readOnly placeholder={labels.plateAutoFill} />
              </Field>
              <Field label={labels.odometer}>
                <input
                  type="number"
                  value={form.currentMileage ?? ""}
                  onChange={(event) => updateField("currentMileage", event.target.value)}
                  placeholder={labels.odometerPlaceholder}
                />
              </Field>
              <Field label={labels.maintenanceDate}>
                <input
                  type="date"
                  value={form.serviceDate ?? ""}
                  onChange={(event) => updateField("serviceDate", event.target.value)}
                />
              </Field>
              <Field label={labels.mechanic}>
                <input
                  value={form.mechanic ?? ""}
                  onChange={(event) => updateField("mechanic", event.target.value)}
                  placeholder={labels.mechanicPlaceholder}
                />
              </Field>
              <Field label={labels.workshopOptional} hint={labels.optional}>
                <input
                  value={form.workshop ?? ""}
                  onChange={(event) => updateField("workshop", event.target.value)}
                  placeholder={labels.workshopPlaceholder}
                />
              </Field>
            </div>
          </Section>

          <Section icon={Wrench} title={labels.sectionDetails} subtitle={labels.sectionDetailsText}>
            <div className="maint-form-grid">
              <Field label={labels.maintenanceType}>
                <select
                  value={form.maintenanceType ?? "generalService"}
                  onChange={(event) => updateField("maintenanceType", event.target.value)}
                >
                  {MAINTENANCE_FORM_TYPE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {labels.types[key] || key}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={labels.priority}>
                <select
                  value={form.priority ?? "medium"}
                  onChange={(event) => updateField("priority", event.target.value)}
                >
                  {MAINTENANCE_PRIORITY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {labels.priorities[key] || key}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={labels.status}>
                <select
                  value={form.status ?? "pending"}
                  onChange={(event) => updateField("status", event.target.value)}
                  disabled={!canChangeStatus}
                >
                  {MAINTENANCE_FORM_STATUS_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {labels.statuses[key] || key}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={labels.description}>
                <textarea
                  className="form-textarea"
                  value={form.description ?? ""}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder={labels.descriptionPlaceholder}
                  rows={3}
                />
              </Field>
            </div>

            {type === "tyreReplacement" ? (
              <div className="maint-dynamic-panel">
                <strong>{labels.tyreDetails}</strong>
                <div className="maint-form-grid">
                  <Field label={labels.tyrePosition}>
                    <select
                      value={details.tyrePosition ?? ""}
                      onChange={(event) => updateDetail("tyrePosition", event.target.value)}
                    >
                      <option value="">{labels.selectOption}</option>
                      {TYRE_POSITION_KEYS.map((key) => (
                        <option key={key} value={key}>
                          {labels.tyrePositions[key] || key}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={labels.tyreSerialNumber}>
                    <input
                      value={details.tyreSerialNumber ?? ""}
                      onChange={(event) => updateDetail("tyreSerialNumber", event.target.value)}
                      placeholder={labels.tyreSerialPlaceholder}
                    />
                  </Field>
                  <Field label={labels.tyreSize}>
                    <input
                      value={details.tyreSize ?? ""}
                      onChange={(event) => updateDetail("tyreSize", event.target.value)}
                      placeholder={labels.tyreSizePlaceholder}
                    />
                  </Field>
                  <Field label={labels.tyreManufacturer}>
                    <input
                      value={details.tyreManufacturer ?? ""}
                      onChange={(event) => updateDetail("tyreManufacturer", event.target.value)}
                      placeholder={labels.tyreManufacturerPlaceholder}
                    />
                  </Field>
                  <Field label={labels.expectedReplacementMileage}>
                    <input
                      type="number"
                      value={details.expectedReplacementMileage ?? ""}
                      onChange={(event) =>
                        updateDetail("expectedReplacementMileage", event.target.value)
                      }
                      placeholder={labels.expectedMileagePlaceholder}
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {type === "batteryReplacement" ? (
              <div className="maint-dynamic-panel">
                <strong>{labels.batteryDetails}</strong>
                <div className="maint-form-grid">
                  <Field label={labels.batteryBrand}>
                    <input
                      value={details.batteryBrand ?? ""}
                      onChange={(event) => updateDetail("batteryBrand", event.target.value)}
                      placeholder={labels.batteryBrandPlaceholder}
                    />
                  </Field>
                  <Field label={labels.batterySerialNumber}>
                    <input
                      value={details.batterySerialNumber ?? ""}
                      onChange={(event) => updateDetail("batterySerialNumber", event.target.value)}
                      placeholder={labels.batterySerialPlaceholder}
                    />
                  </Field>
                  <Field label={labels.batteryCapacityAh}>
                    <input
                      type="number"
                      value={details.batteryCapacityAh ?? ""}
                      onChange={(event) => updateDetail("batteryCapacityAh", event.target.value)}
                      placeholder={labels.batteryCapacityPlaceholder}
                    />
                  </Field>
                  <Field label={labels.batteryWarranty}>
                    <input
                      value={details.batteryWarranty ?? ""}
                      onChange={(event) => updateDetail("batteryWarranty", event.target.value)}
                      placeholder={labels.batteryWarrantyPlaceholder}
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {type === "oilChange" ? (
              <div className="maint-dynamic-panel">
                <strong>{labels.oilDetails}</strong>
                <div className="maint-form-grid">
                  <Field label={labels.oilBrand}>
                    <input
                      value={details.oilBrand ?? ""}
                      onChange={(event) => updateDetail("oilBrand", event.target.value)}
                      placeholder={labels.oilBrandPlaceholder}
                    />
                  </Field>
                  <Field label={labels.oilGrade}>
                    <input
                      value={details.oilGrade ?? ""}
                      onChange={(event) => updateDetail("oilGrade", event.target.value)}
                      placeholder={labels.oilGradePlaceholder}
                    />
                  </Field>
                  <Field label={labels.oilQuantityLitres}>
                    <input
                      type="number"
                      value={details.oilQuantityLitres ?? ""}
                      onChange={(event) => updateDetail("oilQuantityLitres", event.target.value)}
                      placeholder={labels.oilQuantityPlaceholder}
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {type === "brakeService" ? (
              <div className="maint-dynamic-panel">
                <strong>{labels.brakeDetails}</strong>
                <div className="maint-form-grid">
                  <Field label={labels.brakePosition}>
                    <input
                      value={details.brakePosition ?? ""}
                      onChange={(event) => updateDetail("brakePosition", event.target.value)}
                      placeholder={labels.brakePositionPlaceholder}
                    />
                  </Field>
                  <Field label={labels.brakeBrand}>
                    <input
                      value={details.brakeBrand ?? ""}
                      onChange={(event) => updateDetail("brakeBrand", event.target.value)}
                      placeholder={labels.brakeBrandPlaceholder}
                    />
                  </Field>
                </div>
              </div>
            ) : null}
          </Section>

          <Section icon={Paperclip} title={labels.sectionParts} subtitle={labels.sectionPartsText}>
            <div className="maint-parts-stack">
              {(form.parts ?? []).map((part, index) => (
                <div key={part.id} className="maint-part-card">
                  <div className="maint-part-card-head">
                    <strong>
                      {labels.part} {index + 1}
                    </strong>
                    <button
                      type="button"
                      className="inline-link danger"
                      onClick={() => removePart(part.id)}
                    >
                      <Trash2 size={14} />
                      {labels.removePart}
                    </button>
                  </div>
                  <div className="maint-form-grid parts-grid">
                    <Field label={labels.partName}>
                      <input
                        value={part.partName ?? ""}
                        onChange={(event) => updatePart(part.id, "partName", event.target.value)}
                        placeholder={labels.partNamePlaceholder}
                      />
                    </Field>
                    <Field label={labels.partNumber}>
                      <input
                        value={part.partNumber ?? ""}
                        onChange={(event) => updatePart(part.id, "partNumber", event.target.value)}
                        placeholder={labels.partNumberPlaceholder}
                      />
                    </Field>
                    <Field label={labels.brand}>
                      <input
                        value={part.brand ?? ""}
                        onChange={(event) => updatePart(part.id, "brand", event.target.value)}
                        placeholder={labels.brandPlaceholder}
                      />
                    </Field>
                    <Field label={labels.quantity}>
                      <input
                        type="number"
                        min="0"
                        value={part.quantity ?? 1}
                        onChange={(event) => updatePart(part.id, "quantity", event.target.value)}
                        placeholder="1"
                      />
                    </Field>
                    <Field label={labels.unitPrice}>
                      <input
                        type="number"
                        min="0"
                        value={part.unitPrice ?? 0}
                        onChange={(event) => updatePart(part.id, "unitPrice", event.target.value)}
                        placeholder="0"
                      />
                    </Field>
                    <Field label={labels.totalPrice}>
                      <input value={formatMoney(part.totalPrice || 0, language)} readOnly />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="button secondary small" onClick={addPart}>
              <Plus size={14} />
              {labels.addPart}
            </button>
          </Section>

          <Section icon={Receipt} title={labels.sectionCosts} subtitle={labels.sectionCostsText}>
            <div className="maint-form-grid cost-grid">
              <Field label={labels.laborCost}>
                <input
                  type="number"
                  min="0"
                  value={form.laborCost ?? ""}
                  onChange={(event) => updateField("laborCost", event.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label={labels.partsCost} hint={labels.autoCalculated}>
                <input value={formatMoney(computedPartsCost, language)} readOnly />
              </Field>
              <Field label={labels.otherExpenses}>
                <input
                  type="number"
                  min="0"
                  value={form.otherExpenses ?? ""}
                  onChange={(event) => updateField("otherExpenses", event.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label={labels.grandTotal} hint={labels.autoCalculated}>
                <input className="maint-grand-total" value={formatMoney(grandTotal, language)} readOnly />
              </Field>
            </div>
          </Section>

          <Section icon={Upload} title={labels.sectionAttachments} subtitle={labels.sectionAttachmentsText}>
            <label
              className={`maint-dropzone${dragActive ? " active" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                handleFiles(event.dataTransfer.files);
              }}
            >
              <Upload size={20} />
              <strong>{uploading ? labels.uploading : labels.dropFiles}</strong>
              <span>{labels.dropFilesHint}</span>
              <input
                type="file"
                multiple
                accept=".pdf,image/*,.csv,.xls,.xlsx"
                disabled={uploading}
                onChange={(event) => {
                  handleFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            <div className="upload-list">
              {(form.files ?? []).map((file) => {
                const Icon = categoryIcon(file.category);
                return (
                  <div key={file.id} className="upload-chip">
                    <Icon size={14} />
                    <span>{file.name || file.fileName}</span>
                    <button
                      type="button"
                      className="inline-link danger"
                      onClick={() => onRemoveFile?.(file.id)}
                    >
                      {labels.remove}
                    </button>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section icon={FileText} title={labels.sectionNotes} subtitle={labels.sectionNotesText}>
            <Field label={labels.notes}>
              <textarea
                className="form-textarea"
                value={form.notes ?? ""}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder={labels.notesPlaceholder}
                rows={5}
              />
            </Field>
          </Section>
        </div>

        <div className="modal-footer">
          <button type="button" className="button secondary" onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" className="button primary" onClick={onSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
