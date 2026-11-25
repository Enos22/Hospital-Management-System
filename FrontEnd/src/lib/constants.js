/*
 * TODO: Define backend role values and shared status/payment constants.
 */
export const ROLES = { ADMIN: "admin", DOCTOR: "doctor", PATIENT: "patient", BILLING: "billing"};
export const ALL_ROLES = ["admin", "doctor","patient","billing"];
export const PUBLIC_SIGNUP_ROLES = ["patient"];
export const TOKEN_KEY = "afyacare_token";
export const USER_KEY = "afyacare_user";
export const PAYMENT_METHODS = ["cash", "mobile_money", "card", "insurance"];
export const INVOICES_STATUSES = ["pending", "paid", "partially_paid", "cancelled"];
export const APPOINTMENT_STATUSES = ["scheduled", "completed", "cancelled"];
export const NOTIFICATION_QUERY_KEY = ["notifications"];





