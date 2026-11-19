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