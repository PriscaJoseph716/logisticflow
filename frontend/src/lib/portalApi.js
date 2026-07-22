import { api, getApiErrorMessage } from "./apiClient";
import { clearPortalSession, loadPortalSession, storePortalSession } from "./portalSession";

async function portalCall(request) {
  const response = await request;
  return response.data;
}

function withPortalAuth(config = {}) {
  return {
    ...config,
    __portalAuth: true,
  };
}

export { getApiErrorMessage };

export function setPortalAuthSession({ token, customer, business }) {
  storePortalSession({ token, customer, business });
}

export function getPortalAuthSession() {
  return loadPortalSession();
}

export function clearPortalAuthSession() {
  clearPortalSession();
}

export const portalApi = {
  getBusiness(businessId) {
    return portalCall(api.get(`/portal/business/${encodeURIComponent(businessId)}`, withPortalAuth())).then(
      (data) => data.business,
    );
  },

  login(businessId, { customerCode, password }) {
    return portalCall(
      api.post(
        `/portal/auth/login/${encodeURIComponent(businessId)}`,
        { customerCode, password },
        withPortalAuth(),
      ),
    ).then((data) => {
      const session = {
        token: data.token,
        customer: data.customer,
        business: data.business,
      };
      storePortalSession(session);
      return session;
    });
  },

  logout() {
    return portalCall(api.post("/portal/auth/logout", {}, withPortalAuth()))
      .catch(() => null)
      .finally(() => {
        clearPortalSession();
      });
  },

  me() {
    return portalCall(api.get("/portal/me", withPortalAuth())).then((data) => ({
      customer: data.customer,
      business: data.business,
    }));
  },

  changePassword(payload) {
    return portalCall(api.post("/portal/auth/change-password", payload, withPortalAuth())).then(
      (data) => data.customer,
    );
  },

  dashboard() {
    return portalCall(api.get("/portal/dashboard", withPortalAuth())).then((data) => data.summary);
  },

  listOrders() {
    return portalCall(api.get("/portal/orders", withPortalAuth())).then((data) => ({
      orders: data.orders ?? [],
      shipments: data.shipments ?? [],
    }));
  },

  createOrder(payload) {
    return portalCall(api.post("/portal/orders", payload, withPortalAuth())).then((data) => data.order);
  },

  listInvoices() {
    return portalCall(api.get("/portal/invoices", withPortalAuth())).then((data) => data.items ?? []);
  },

  getInvoice(id) {
    return portalCall(api.get(`/portal/invoices/${encodeURIComponent(id)}`, withPortalAuth())).then(
      (data) => data.item,
    );
  },

  listPayments() {
    return portalCall(api.get("/portal/payments", withPortalAuth())).then((data) => data.items ?? []);
  },

  statement() {
    return portalCall(api.get("/portal/statement", withPortalAuth())).then((data) => data.statement);
  },

  tracking() {
    return portalCall(api.get("/portal/tracking", withPortalAuth())).then((data) => data.items ?? []);
  },

  listNotifications() {
    return portalCall(api.get("/portal/notifications", withPortalAuth())).then(
      (data) => data.items ?? [],
    );
  },

  markNotificationRead(id) {
    return portalCall(
      api.patch(`/portal/notifications/${encodeURIComponent(id)}/read`, {}, withPortalAuth()),
    ).then((data) => data.item);
  },

  updateProfile(payload) {
    return portalCall(api.patch("/portal/profile", payload, withPortalAuth())).then(
      (data) => data.customer,
    );
  },
};
