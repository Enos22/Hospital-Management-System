export class ApiError extends Error {
  constructor(message, { status = 0, details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

export function getApiErrorMessage(payload, fallback) {
  const candidate =
    payload?.message ??
    payload?.error ??
    payload?.errors ??
    payload?.detail ??
    fallback;

  if (Array.isArray(candidate)) return candidate.filter(Boolean).join(" ");
  if (typeof candidate === "string" && candidate.trim()) return candidate;
  return fallback;
}
