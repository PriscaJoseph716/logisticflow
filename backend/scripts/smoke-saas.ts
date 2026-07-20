/**
 * Smoke-test SaaS create flows against a running API + database.
 * Usage: npx tsx scripts/smoke-saas.ts [baseUrl]
 */
import "dotenv/config";

const BASE = (process.argv[2] ?? `http://127.0.0.1:${process.env.PORT || 5001}`).replace(/\/$/, "");
const API = `${BASE}/api`;

type Json = Record<string, unknown>;

async function call(
  method: string,
  path: string,
  options: { body?: Json; token?: string } = {},
) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  const json = text ? (JSON.parse(text) as Json) : {};
  return { status: response.status, json };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const stamp = Date.now();
  console.log(`Smoke SaaS against ${API}`);

  const health = await fetch(`${BASE}/health`);
  const healthJson = (await health.json()) as Json;
  console.log("health", health.status, healthJson);
  assert(health.status === 200, "Health check failed");

  const email = `saas-smoke-${stamp}@example.com`;
  const password = "password123";
  const register = await call("POST", "/auth/register", {
    body: {
      fullName: "SaaS Smoke Owner",
      companyName: `Smoke Co ${stamp}`,
      email,
      password,
    },
  });
  console.log("register", register.status, {
    businessId: (register.json.business as Json | undefined)?.businessId,
  });
  assert(register.status === 201, `Register failed: ${JSON.stringify(register.json)}`);
  const token = register.json.token as string;
  assert(token, "Missing token");

  const customer = await call("POST", "/customers", {
    token,
    body: {
      customerCode: `CUS-${String(stamp).slice(-4)}`,
      name: "Acme Receiver",
      phone: "0700000001",
      location: "Dar es Salaam",
    },
  });
  console.log("customer", customer.status, customer.json.item ? "ok" : customer.json);
  assert(customer.status === 201, `Customer create failed: ${JSON.stringify(customer.json)}`);
  const customerId = (customer.json.item as Json).id as string;

  const supplier = await call("POST", "/suppliers", {
    token,
    body: {
      supplierCode: `SUP-${String(stamp).slice(-4)}`,
      name: "Bulk Supplier",
      contact: "0700000002",
      location: "Morogoro",
      buyingPrice: 80000,
      sellingPrice: 120000,
    },
  });
  console.log("supplier", supplier.status, supplier.json.item ? "ok" : supplier.json);
  assert(supplier.status === 201, `Supplier create failed: ${JSON.stringify(supplier.json)}`);
  const supplierId = (supplier.json.item as Json).id as string;

  const vehicle = await call("POST", "/fleet", {
    token,
    body: {
      name: "T 123 ABC",
      headPlateNumber: `T${String(stamp).slice(-5)}`,
      trailerPlateNumber: `TR${String(stamp).slice(-4)}`,
      category: "owned",
      status: "ACTIVE",
      documentsJson: {
        ownership: "owned",
        driverName: "John Driver",
        driverPhone: "0700000003",
        licenseNumber: "DL-999",
      },
    },
  });
  console.log("fleet", vehicle.status, vehicle.json.item ? "ok" : vehicle.json);
  assert(vehicle.status === 201, `Fleet create failed: ${JSON.stringify(vehicle.json)}`);
  const vehicleId = (vehicle.json.item as Json).id as string;

  const shipment = await call("POST", "/shipments", {
    token,
    body: {
      shipmentCode: `SHP-${String(stamp).slice(-6)}`,
      supplierId,
      customerId,
      vehicleId,
      origin: "Morogoro",
      destination: "Dar es Salaam",
      quantityTons: 25,
      status: "PENDING",
      deliveryStatus: "SCHEDULED",
      scheduledDate: new Date().toISOString(),
    },
  });
  console.log("shipment", shipment.status, shipment.json.item ? "ok" : shipment.json);
  assert(shipment.status === 201, `Shipment create failed: ${JSON.stringify(shipment.json)}`);
  const shipmentId = (shipment.json.item as Json).id as string;

  const delivered = await call("PATCH", `/shipments/${shipmentId}`, {
    token,
    body: { status: "DELIVERED" },
  });
  console.log("deliver shipment", delivered.status, (delivered.json.item as Json)?.status);
  assert(delivered.status === 200, `Deliver failed: ${JSON.stringify(delivered.json)}`);

  const deliveries = await call("GET", "/deliveries", { token });
  const deliveryItems = (deliveries.json.items as unknown[]) ?? [];
  console.log("deliveries", deliveries.status, deliveryItems.length);
  assert(deliveryItems.length >= 1, "Expected a delivery record");

  const billing = await call("GET", "/billing", { token });
  const invoices = (billing.json.items as Json[]) ?? [];
  console.log("billing", billing.status, invoices.length);
  assert(invoices.length >= 1, "Expected an invoice");
  const invoiceId = invoices[0].id as string;

  const payment = await call("POST", "/payments", {
    token,
    body: {
      invoiceId,
      amount: 500000,
      method: "BANK_TRANSFER",
      paymentDate: new Date().toISOString(),
    },
  });
  console.log("payment", payment.status, payment.json.item ? "ok" : payment.json);
  assert(payment.status === 201, `Payment failed: ${JSON.stringify(payment.json)}`);

  const maintenance = await call("POST", "/maintenance", {
    token,
    body: {
      vehicleId,
      maintenanceDate: new Date().toISOString().slice(0, 10),
      maintenanceType: "SERVICE",
      workshop: "City Garage",
      mechanic: "Asha",
      currentMileage: 12000,
      laborCost: 50000,
      otherCost: 10000,
      status: "COMPLETED",
      parts: [{ partName: "Oil Filter", quantity: 1, unitPrice: 25000 }],
    },
  });
  console.log("maintenance", maintenance.status, maintenance.json.item ? "ok" : maintenance.json);
  assert(maintenance.status === 201, `Maintenance failed: ${JSON.stringify(maintenance.json)}`);

  const dashboard = await call("GET", "/dashboard/summary", { token });
  console.log("dashboard", dashboard.status, dashboard.json.item ?? dashboard.json);
  assert(dashboard.status === 200, "Dashboard summary failed");

  console.log("SMOKE OK");
}

main().catch((error) => {
  console.error("SMOKE FAILED", error);
  process.exit(1);
});
