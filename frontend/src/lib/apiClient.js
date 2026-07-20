import axios from "axios";
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

function shouldRetry(error, config) {
  if (!config || config.method?.toLowerCase() !== "get") {
    return false;
  }

  if (error.response) {
    return false;
  }

  const retryCount = config.__retryCount ?? 0;
  return retryCount < 1;
}

function isAuthRoute(url = "") {
  return url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/logout");
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
  const token = inMemorySession?.token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};
    const requestUrl = originalRequest.url ?? "";

    // Don't wipe the session on /me failures during bootstrap — authApi.bootstrap decides.
    const isMeRoute = requestUrl.includes("/me");

    if (
      error.response?.status === 401 &&
      !originalRequest.__authHandled &&
      !isAuthRoute(requestUrl) &&
      !isMeRoute
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
      await wait(600);
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    if (!error.response && (error.code === "ECONNABORTED" || error.message === "Network Error")) {
      return "We couldn't connect right now. Please wait a moment and try again.";
    }

    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export async function unwrapApi(call) {
  const response = await call;
  return response.data?.data ?? response.data;
}

export { api };
