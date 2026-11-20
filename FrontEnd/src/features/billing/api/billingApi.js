const API_BASE = "/api";

async function request(path, { method = "GET", body, query } = {}) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const token = localStorage.getItem("access_token");
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = response.status === 204 ? null : await response.json();

  if (!response.ok || payload?.success === false) {
    const details = payload?.message ?? payload?.errors ?? payload?.error;
    const message = Array.isArray(details) ? details.join(", ") : details;
    const error = new Error(message || `Billing request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return payload?.data ?? payload;
}

export function listInvoices({ patient_id, status } = {}) {
  return request("/billing/invoices", { query: { patient_id, status } });
}

export function getInvoice(invoiceId) {
  return request(`/billing/invoices/${encodeURIComponent(invoiceId)}`);
}

export function createInvoice({
  patient_id,
  items,
  tax_rate = 0,
  discount = 0,
}) {
  return request("/billing/invoices", {
    method: "POST",
    body: { patient_id, items, tax_rate, discount },
  });
}

export function cancelInvoice(invoiceId) {
  return request(`/billing/invoices/${encodeURIComponent(invoiceId)}/cancel`, {
    method: "POST",
  });
}

export function recordPayment(invoiceId, { amount, method, reference }) {
  return request(
    `/billing/invoices/${encodeURIComponent(invoiceId)}/payments`,
    {
      method: "POST",
      body: { amount, method, reference },
    },
  );
}

export function getPatientBalance(patientId) {
  return request(
    `/billing/patients/${encodeURIComponent(patientId)}/balance`,
  );
}

export function getOutstandingInvoices() {
  return request("/billing/outstanding");
}

export function getRevenueReport({ start, end } = {}) {
  return request("/reports/revenue", { query: { start, end } });
}

export function getPaymentReport({ start, end } = {}) {
  return request("/reports/payments", { query: { start, end } });
}

const billingApi = {
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

export default billingApi;
