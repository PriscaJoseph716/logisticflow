import { createApp } from "../src/app.js";
import { prisma } from "../src/config/database.js";

type Json = Record<string, unknown>;

async function request(
  app: ReturnType<typeof createApp>,
  method: string,
  path: string,
  options: { body?: Json; cookie?: string } = {},
) {
  const server = app.listen(0);
  const address = server.address();

  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Unable to bind test server.");
  }

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(options.cookie ? { Cookie: options.cookie } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const setCookie = response.headers.getSetCookie?.() ?? [];
    const text = await response.text();
    const json = text ? (JSON.parse(text) as Json) : {};

    return {
      status: response.status,
      json,
      cookie: setCookie.map((value) => value.split(";")[0]).join("; "),
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

async function main() {
  await prisma.$connect();
  const app = createApp();
  const stamp = Date.now();
  const email = `owner-${stamp}@example.com`;
  const password = "password123";
  const companyName = "Shared Company Name";

  const root = await request(app, "GET", "/");
  console.log("GET /", root.status, root.json);
  if (root.status !== 200 || root.json.message !== "Backend running") {
    throw new Error("GET / failed");
  }

  const health = await request(app, "GET", "/health");
  console.log("GET /health", health.status, health.json);
  if (health.status !== 200 || health.json.message !== "Database connected") {
    throw new Error("GET /health failed");
  }

  const registerA = await request(app, "POST", "/api/auth/register", {
    body: {
      fullName: "Owner A",
      companyName,
      email,
      password,
    },
  });
  const businessIdA = (registerA.json.business as Json | undefined)?.businessId as string | undefined;
  console.log("POST /api/auth/register A", registerA.status, { businessId: businessIdA });
  if (registerA.status !== 201 || !businessIdA?.startsWith("LOG-") || !registerA.cookie) {
    throw new Error(`Register A failed: ${JSON.stringify(registerA.json)}`);
  }

  const registerB = await request(app, "POST", "/api/auth/register", {
    body: {
      fullName: "Owner B",
      companyName,
      email,
      password,
    },
  });
  const businessIdB = (registerB.json.business as Json | undefined)?.businessId as string | undefined;
  console.log("POST /api/auth/register B", registerB.status, { businessId: businessIdB });
  if (registerB.status !== 201 || !businessIdB?.startsWith("LOG-") || businessIdB === businessIdA) {
    throw new Error(`Register B failed: ${JSON.stringify(registerB.json)}`);
  }

  const logout = await request(app, "POST", "/api/auth/logout", { cookie: registerA.cookie });
  console.log("POST /api/auth/logout", logout.status, logout.json);

  const loginWrongBusiness = await request(app, "POST", "/api/auth/login", {
    body: { businessId: businessIdB, email, password: "wrong-password" },
  });
  if (loginWrongBusiness.status !== 401) {
    throw new Error("Expected 401 for bad password");
  }

  const loginA = await request(app, "POST", "/api/auth/login", {
    body: { businessId: businessIdA, email, password },
  });
  console.log("POST /api/auth/login A", loginA.status, {
    success: loginA.json.success,
    businessId: (loginA.json.business as Json | undefined)?.businessId,
  });
  if (loginA.status !== 200 || loginA.json.success !== true || !loginA.cookie) {
    throw new Error(`Login A failed: ${JSON.stringify(loginA.json)}`);
  }

  const meA = await request(app, "GET", "/api/me", { cookie: loginA.cookie });
  if (meA.status !== 200 || (meA.json.business as Json | undefined)?.businessId !== businessIdA) {
    throw new Error(`GET /api/me isolation failed: ${JSON.stringify(meA.json)}`);
  }

  const loginB = await request(app, "POST", "/api/auth/login", {
    body: { businessId: businessIdB, email, password },
  });
  console.log("POST /api/auth/login B", loginB.status, {
    businessId: (loginB.json.business as Json | undefined)?.businessId,
  });
  if (loginB.status !== 200 || (loginB.json.business as Json | undefined)?.businessId !== businessIdB) {
    throw new Error(`Login B failed: ${JSON.stringify(loginB.json)}`);
  }

  console.log("All endpoint checks passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
