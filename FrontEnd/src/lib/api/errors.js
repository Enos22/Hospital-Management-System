/*
 * TODO: Normalize API error shapes while preserving status and server details.
 */
export function normalizeError(error, status) {
 let message = "Something went Wrong. Please try again!";
 let details = null

 if (error && typeof error === "object"){

  if (typeof error.error === "string") message = error.error;
  else if (typeof error.message === "string") message = error.message;
  else if (error.errors){ details = error.errors; message = "Please check the form and try again"; }
 }else if (typeof error === "string") message = error;

 return {message, details, status: status || null, isAuth: status ===401, isForbidden: status === 403, isValidation: status === 400};
}
export function getErrorMessage(err) {
 return err?.message || "something went wrong."
}

export function getApiErrorMessage(error, fallback = "The request could not be completed.") {
 if (typeof error === "string") return error;
 if (error && typeof error === "object") {
  if (typeof error.message === "string") return error.message;
  if (typeof error.error === "string") return error.error;
  if (typeof error.msg === "string") return error.msg;
 }
 return fallback;
}