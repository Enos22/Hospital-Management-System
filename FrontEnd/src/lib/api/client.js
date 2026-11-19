import { ApiError, getApiErrorMessage } from "./errors.js";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
export const ACCESS_TOKEN_KEY = "afyacare.accessToken";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = getAccessToken();

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "Unable to connect to the server.",
    );
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new ApiError("The server returned an invalid response.", {
          status: response.status,
          details: text,
        });
      }
      payload = { message: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(payload, `Request failed with status ${response.status}.`),
      { status: response.status, details: payload },
    );
  }

  return payload;
}
