/*
 * TODO: Normalize API error shapes while preserving status and server details.
 */
export function normalizeError(error, status) {
  let message = "Something went wrong. Please try again.";
  let details = null;

  if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object") {
    if (typeof error.message === "string") {
      message = error.message;
    } else if (typeof error.error === "string") {
      message = error.error;
    } else if (typeof error.msg === "string") {
      message = error.msg;
    } else if (Array.isArray(error.error)) {
      details = error.error;
      message =
        error.error.find((item) => typeof item === "string") ||
        "Please check the form and try again.";
    } else if (error.errors) {
      details = error.errors;
      message = Array.isArray(error.errors)
        ? error.errors.find((item) => typeof item === "string") ||
          "Please check the form and try again."
        : "Please check the form and try again.";
    }
  }

   return {
    message,
    details,
    status: status || null,
    isAuth: status === 401,
    isForbidden: status === 403,
    isValidation: status === 400 || status === 422,
  };
}
export function getErrorMessage(err) {
  return err?.message || "Something went wrong.";
}

export function getApiErrorMessage(error, fallback = "The request could not be completed.") {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if (typeof error.message === "string") return error.message;
    if (typeof error.error === "string") return error.error;
    if (typeof error.msg === "string") return error.msg;
    if (Array.isArray(error.error)) {
      const firstMessage = error.error.find((item) => typeof item === "string");
      if (firstMessage) return firstMessage;
    }
    if (Array.isArray(error.errors)) {
      const firstMessage = error.errors.find((item) => typeof item === "string");
      if (firstMessage) return firstMessage;
    }
  }
  return fallback;
}