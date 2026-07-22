import axios from "axios";
import { loadPortalSession } from "./portalSession";
import { clearStoredSession, loadStoredSession, storeSession } from "./session";

const LOCAL_API_URL = "http://127.0.0.1:5001/api";
const DEPLOYED_API_URL = "https://logisticflow-uzop.onrender.com/api";
const API_TIMEOUT_MS = 60000;

function normalizeApiUrl(url) {
  const trimmedUrl = url.replace(/\/+$/, "");
  return trimmedUrl.endsWith("/api") ? trimmedUrl : `${trimmedUrl}/api`;
}

function resolveApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) {
    return normalizeApiUrl(configuredUrl);
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return LOCAL_API_URL;
    }
  }

  return DEPLOYED_API_URL;
}

let inMemorySession = loadStoredSession();
let authExpiredHandler = () => {};

const api = axios.create({
  baseURL: resolveApiUrl(),
  withCredentials: true,
  timeout: API_TIMEOUT_MS,
});

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isNetworkOrTimeoutError(error) {
  return Boolean(
    axios.isAxiosError(error) &&
      !error.response &&
      (error.code === "ECONNABORTED" ||
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error"),
  );
}

function shouldRetry(error, config) {
  if (!config) return false;

  const retryCount = config.__retryCount ?? 0;
  if (retryCount >= 1) return false;

  // Retry once on cold-start / flaky network for any method.
  if (isNetworkOrTimeoutError(error)) return true;

  // Retry GET once on 502/503/504 (Render waking up).
  if (config.method?.toLowerCase() === "get" && [502, 503, 504].includes(error.response?.status)) {
    return true;
  }

  return false;
}

function isAuthRoute(url = "") {
  return url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/logout");
}

function looksTechnical(message = "") {
  const text = String(message).toLowerCase();
  return (
    text.includes("cannot read properties") ||
    text.includes("reading 'trim'") ||
    text.includes("undefined is not") ||
    text.includes("null is not") ||
    text.includes("prisma") ||
    text.includes("econn") ||
    text.includes("socket") ||
    text.includes("stack") ||
    text.includes("typeerror") ||
    text.includes("referenceerror") ||
    text.includes("unique constraint") ||
    text.includes("internal server error") ||
    /at\s+\w+\s+\(/.test(message)
  );
}

export function getSession() {
  return inMemorySession;
}

export function setSession(session) {
  inMemorySession = session;
  if (session) {
    storeSession(session);
  } else {
    clearStoredSession();
  }
}

export function clearSession() {
  inMemorySession = null;
  clearStoredSession();
}

export function configureApiClient({ onAuthExpired } = {}) {
  authExpiredHandler = onAuthExpired ?? (() => {});
}

api.interceptors.request.use((config) => {
  const requestUrl = config.url ?? "";
  const isPortalRequest = Boolean(config.__portalAuth) || requestUrl.includes("/portal");
  config.headers = config.headers ?? {};

  if (isPortalRequest) {
    const portalToken = loadPortalSession()?.token;
    if (portalToken) {
      config.headers.Authorization = `Bearer ${portalToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  }

  const token = inMemorySession?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};
    const requestUrl = originalRequest.url ?? "";
    const isPortalRequest = Boolean(originalRequest.__portalAuth) || requestUrl.includes("/portal");

    // Don't wipe the session on /me failures during bootstrap — authApi.bootstrap decides.
    const isMeRoute = requestUrl.includes("/me");

    if (
      error.response?.status === 401 &&
      !originalRequest.__authHandled &&
      !isAuthRoute(requestUrl) &&
      !isMeRoute &&
      !isPortalRequest
    ) {
      originalRequest.__authHandled = true;
      const hadSession = Boolean(getSession()?.user);
      clearSession();

      if (hadSession) {
        authExpiredHandler(error);
      }
    }

    if (shouldRetry(error, originalRequest)) {
      originalRequest.__retryCount = (originalRequest.__retryCount ?? 0) + 1;
      await wait(800);
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(error)) {
    if (isNetworkOrTimeoutError(error)) {
      return "We couldn't connect right now. Please wait a moment and try again.";
    }

    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage.trim() && !looksTechnical(serverMessage)) {
      return serverMessage;
    }

    return fallback;
  }

  if (error instanceof Error) {
    if (looksTechnical(error.message)) return fallback;
    return error.message || fallback;
  }

  return fallback;
}

export async function unwrapApi(call) {
  const response = await call;
  return response.data?.data ?? response.data;
}

export { api };
