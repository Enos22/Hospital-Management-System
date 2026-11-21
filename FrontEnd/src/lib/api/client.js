import { TOKEN_KEY, USER_KEY } from "../constants.js";
import { normalizeError } from "./errors.js";

export const SESSION_EXPIRED_EVENT = "afyacare:session-expired";

const BASE_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5555";

export function getApiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSessionStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(getApiUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) clearSessionStorage();
    throw normalizeError(data, response.status);
  }

  return data;
}

export function request(path, options = {}) {
  const { body, ...requestOptions } = options;
  return apiRequest(path, {
    ...requestOptions,
    body: body && typeof body === "string" ? JSON.parse(body) : body,
  });
}

export const get = (path, options = {}) =>
  apiRequest(path, { ...options, method: "GET" });

export const post = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: "POST", body });

export const patch = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: "PATCH", body });
