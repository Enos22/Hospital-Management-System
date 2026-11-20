import { apiRequest } from "../../../lib/api/client";

function addQuery(path, query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  }
  const suffix = params.toString();
  return `${path}${suffix ? `?${suffix}` : ""}`;
}

export function listInvoices({ patient_id, status } = {}) {
  return apiRequest(addQuery("/api/billing/invoices", { patient_id, status }));
}

export function getInvoice(invoiceId) {
  return apiRequest(`/api/billing/invoices/${encodeURIComponent(invoiceId)}`);
}

export function createInvoice({ patient_id, items, tax_rate = 0, discount = 0 }) {
  return apiRequest("/api/billing/invoices", {
    method: "POST",
    body: { patient_id, items, tax_rate, discount },
  });
}

export function cancelInvoice(invoiceId) {
  return apiRequest(`/api/billing/invoices/${encodeURIComponent(invoiceId)}/cancel`, {
    method: "POST",
  });
}

export function recordPayment(invoiceId, { amount, method, reference }) {
  return apiRequest(`/api/billing/invoices/${encodeURIComponent(invoiceId)}/payments`, {
    method: "POST",
    body: { amount, method, reference },
  });
}

export function getPatientBalance(patientId) {
  return apiRequest(`/api/billing/patients/${encodeURIComponent(patientId)}/balance`);
}

export function getOutstandingInvoices() {
  return apiRequest("/api/billing/outstanding");
}

export function getRevenueReport({ start, end } = {}) {
  return apiRequest(addQuery("/api/reports/revenue", { start, end }));
}

export function getPaymentReport({ start, end } = {}) {
  return apiRequest(addQuery("/api/reports/payments", { start, end }));
}

export default {
  listInvoices,
  getInvoice,
  createInvoice,
  cancelInvoice,
  recordPayment,
  getPatientBalance,
  getOutstandingInvoices,
  getRevenueReport,
  getPaymentReport,
};
