import { api, clearSession, getSession, setSession, unwrapApi } from "./apiClient";

function buildQuery(params) {
  return { params };
}

function formatRoleLabel(user) {
  const role = String(user?.role ?? "").toUpperCase();
  if (role === "OWNER") return "Owner";
  return user?.roleName || user?.role || "Member";
}

function normalizeSessionPayload(payload, previousSession = null) {
  const user = payload.user ?? {};
  const business = payload.business ?? {};

  return {
    token: payload.token ?? previousSession?.token ?? null,
    user: {
      ...user,
      role: user.role ?? "OWNER",
      roleName: formatRoleLabel(user),
      permissions: user.permissions ?? [],
    },
    business: {
      ...business,
      // Public tenant code used at login (e.g. LOG-0001)
      businessId: business.businessId ?? "",
      name: business.name ?? business.companyName ?? "",
      companyName: business.companyName ?? business.name ?? "",
    },
  };
}

export const authApi = {
  async register(values) {
    const payload = await unwrapApi(
      api.post("/auth/register", {
        fullName: values.fullName,
        companyName: values.companyName,
        email: values.email,
        password: values.password,
      }),
    );

    const session = normalizeSessionPayload(payload);
    setSession(session);
    return payload;
  },

  async login(values) {
    const identifier = (values.identifier ?? values.email ?? values.login ?? "").trim();
    const payload = await unwrapApi(
      api.post("/auth/login", {
        businessId: values.businessId,
        identifier,
        email: identifier,
        password: values.password,
      }),
    );

    const session = normalizeSessionPayload(payload);
    setSession(session);
    return payload;
  },

  async logout() {
    await api.post("/auth/logout", {});
    clearSession();
  },

  async getCurrentUser() {
    return unwrapApi(api.get("/me"));
  },

  async bootstrap() {
    const existing = getSession();
    if (!existing?.user || !existing?.token) {
      return null;
    }

    try {
      const payload = await this.getCurrentUser();
      const session = normalizeSessionPayload(payload, existing);
      setSession(session);
      return session;
    } catch (_error) {
      clearSession();
      return null;
    }
  },
};

export const teamApi = {
  list() {
    return unwrapApi(api.get("/users"));
  },
  createWorker(payload) {
    return unwrapApi(api.post("/users", payload));
  },
};

export const rolesApi = {
  list() {
    return unwrapApi(api.get("/roles"));
  },
  create(payload) {
    return unwrapApi(api.post("/roles", payload));
  },
};

export const assignmentsApi = {
  list() {
    return unwrapApi(api.get("/assignments"));
  },
  create(payload) {
    return unwrapApi(api.post("/assignments", payload));
  },
  updateStatus(id, status) {
    return unwrapApi(api.patch(`/assignments/${id}/status`, { status }));
  },
  uploadProof(id, payload) {
    return unwrapApi(
      api.post(`/assignments/${id}/proof`, {
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        data: payload.base64Data ?? payload.data,
      }),
    );
  },
};

export const dashboardApi = {
  summary() {
    return unwrapApi(api.get("/dashboard/summary"));
  },
};

export const fleetApi = {
  list(params = {}) {
    return unwrapApi(api.get("/fleet", buildQuery({ page: 1, limit: 200, ...params })));
  },
  create(payload) {
    return unwrapApi(api.post("/fleet", payload));
  },
  update(id, payload) {
    return unwrapApi(api.patch(`/fleet/${id}`, payload));
  },
  remove(id) {
    return unwrapApi(api.delete(`/fleet/${id}`));
  },
};

export const customersApi = {
  list(params = {}) {
    return unwrapApi(api.get("/customers", buildQuery({ page: 1, limit: 200, ...params })));
  },
  create(payload) {
    return unwrapApi(api.post("/customers", payload));
  },
  update(id, payload) {
    return unwrapApi(api.patch(`/customers/${id}`, payload));
  },
  remove(id) {
    return unwrapApi(api.delete(`/customers/${id}`));
  },
};

export const suppliersApi = {
  list(params = {}) {
    return unwrapApi(api.get("/suppliers", buildQuery({ page: 1, limit: 200, ...params })));
  },
  create(payload) {
    return unwrapApi(api.post("/suppliers", payload));
  },
  update(id, payload) {
    return unwrapApi(api.patch(`/suppliers/${id}`, payload));
  },
  remove(id) {
    return unwrapApi(api.delete(`/suppliers/${id}`));
  },
};

export const shipmentsApi = {
  list(params = {}) {
    return unwrapApi(api.get("/shipments", buildQuery({ page: 1, pageSize: 200, ...params })));
  },
  create(payload) {
    return unwrapApi(api.post("/shipments", payload));
  },
  update(id, payload) {
    return unwrapApi(api.patch(`/shipments/${id}`, payload));
  },
  remove(id) {
    return unwrapApi(api.delete(`/shipments/${id}`));
  },
};

export const deliveriesApi = {
  list(params = {}) {
    return unwrapApi(api.get("/deliveries", buildQuery({ page: 1, pageSize: 200, ...params })));
  },
};

export const maintenanceApi = {
  list(params = {}) {
    return unwrapApi(api.get("/maintenance", buildQuery({ page: 1, pageSize: 200, ...params })));
  },
  analytics(params = {}) {
    return unwrapApi(api.get("/maintenance/analytics", buildQuery(params)));
  },
  upcoming(params = {}) {
    return unwrapApi(api.get("/maintenance/upcoming-service", buildQuery(params)));
  },
  mileageReminders(params = {}) {
    return unwrapApi(api.get("/maintenance/mileage-reminders", buildQuery(params)));
  },
  create(payload) {
    return unwrapApi(api.post("/maintenance", payload));
  },
  update(id, payload) {
    return unwrapApi(api.patch(`/maintenance/${id}`, payload));
  },
  remove(id) {
    return unwrapApi(api.delete(`/maintenance/${id}`));
  },
};

export const billingApi = {
  list(params = {}) {
    return unwrapApi(api.get("/billing", buildQuery({ page: 1, pageSize: 200, ...params })));
  },
  summary(params = {}) {
    return unwrapApi(api.get("/billing/summary", buildQuery(params)));
  },
};

export const paymentsApi = {
  list(params = {}) {
    return unwrapApi(api.get("/payments", buildQuery({ page: 1, pageSize: 200, ...params })));
  },
  create(payload) {
    return unwrapApi(api.post("/payments", payload));
  },
  update(id, payload) {
    return unwrapApi(api.patch(`/payments/${id}`, payload));
  },
  remove(id) {
    return unwrapApi(api.delete(`/payments/${id}`));
  },
};

export const notificationsApi = {
  list(params = {}) {
    return unwrapApi(api.get("/notifications", buildQuery({ page: 1, limit: 100, ...params })));
  },
};

export const reportsApi = {
  list(params = {}) {
    return unwrapApi(api.get("/reports", buildQuery({ page: 1, pageSize: 100, ...params })));
  },
  async exportReport(payload) {
    const response = await api.post("/reports/exports", payload, {
      responseType: "blob",
    });

    return {
      blob: response.data,
      contentType: response.headers["content-type"],
      fileName:
        response.headers["content-disposition"]?.match(/filename="(.+)"/)?.[1] ??
        `${payload.name}.${payload.format === "excel" ? "xlsx" : payload.format}`,
    };
  },
};

export const uploadsApi = {
  async uploadFiles(files, metadata = {}) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    Object.entries(metadata).forEach(([key, value]) => {
      if (value != null) {
        formData.append(key, String(value));
      }
    });

    return unwrapApi(
      api.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  },
};
