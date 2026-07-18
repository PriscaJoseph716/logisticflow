import axios from "axios";
import { clearStoredSession, loadStoredSession, storeSession } from "./session";

const LOCAL_API_URL = "http://127.0.0.1:5000/api";
const DEPLOYED_API_URL = "https://logisticflow-uzop.onrender.com/api";
const API_TIMEOUT_MS = 60000;

function normalizeApiUrl(url) {
  return url.replace(/\/+$/, "");
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
let refreshRequest = null;
let authExpiredHandler = () => {};

const api = axios.create({
  baseURL: resolveApiUrl(),
  withCredentials: true,
  timeout: API_TIMEOUT_MS,
});

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isAuthRoute(url = "") {
  return url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh-token");
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

async function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = api
      .post("/auth/refresh-token", {})
      .then((response) => {
        const data = response.data?.data;
        const nextSession = data
          ? {
              user: data.user,
              business: data.business,
              accessToken: data.tokens.accessToken,
              expiresIn: data.tokens.expiresIn,
            }
          : null;

        if (!nextSession) {
          throw new Error("Failed to refresh session.");
        }

        setSession(nextSession);
        return nextSession.accessToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

api.interceptors.request.use((config) => {
  const session = getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};

    if (error.response?.status === 401 && !originalRequest.__isRetryAfterRefresh && !isAuthRoute(originalRequest.url)) {
      try {
        const nextToken = await refreshAccessToken();
        originalRequest.__isRetryAfterRefresh = true;
        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${nextToken}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        clearSession();
        authExpiredHandler(refreshError);
        return Promise.reject(refreshError);
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
      return "Unable to reach the server. If the backend is waking up, please wait a moment and try again.";
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
