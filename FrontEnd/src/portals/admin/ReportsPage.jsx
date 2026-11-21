/*
 * TODO: Present revenue and payment reports with date-range filters.
 */
import { useEffect, useState } from "react";
import { getToken } from "../../lib/api/client";

const API_BASE_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export default function ReportsPage() {
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceJson, setInvoiceJson] = useState(
    '{"patient_id":1,"items":[{"description":"Consultation","quantity":1,"unit_price":0}]}'
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [invoices, setInvoices] = useState(null);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function apiRequest(path, options = {}) {
    if (!API_BASE_URL && !import.meta.env.DEV) {
      throw new Error("VITE_API_BASE_URL is missing from the frontend .env file.");
    }

    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error || `Request failed (${response.status})`
      );
    }

    return data;
  }

  async function runRequest(request, successMessage = "") {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await request();
      setOutput(data);
      if (successMessage) setMessage(successMessage);
      return data;
    } catch (err) {
      setError(err.message || "Something went wrong.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loadInvoices() {
    const data = await runRequest(() =>
      apiRequest("/api/billing/invoices")
    );
    if (data !== null) setInvoices(data);
  }

  async function createInvoice(event) {
    event.preventDefault();

    let body;
    try {
      body = JSON.parse(invoiceJson);
    } catch {
      setError("Invoice body must be valid JSON.");
      return;
    }

    const data = await runRequest(
      () =>
        apiRequest("/api/billing/invoices", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      "Invoice created."
    );

    if (data !== null) await loadInvoices();
  }

  async function viewInvoice(event) {
    event.preventDefault();
    if (!invoiceId.trim()) {
      setError("Enter an invoice ID.");
      return;
    }

    await runRequest(() =>
      apiRequest(
        `/api/billing/invoices/${encodeURIComponent(invoiceId.trim())}`
      )
    );
  }

  async function cancelInvoice() {
    if (!invoiceId.trim()) {
      setError("Enter an invoice ID.");
      return;
    }

    if (window.prompt('Type "CANCEL INVOICE" to confirm:') !== "CANCEL INVOICE") {
      return;
    }

    const data = await runRequest(
      () =>
        apiRequest(
          `/api/billing/invoices/${encodeURIComponent(invoiceId.trim())}/cancel`,
          {
            method: "POST",
          }
        ),
      "Invoice cancelled."
    );

    if (data !== null) await loadInvoices();
  }

  async function recordPayment(event) {
    event.preventDefault();

    if (!invoiceId.trim()) {
      setError("Enter an invoice ID.");
      return;
    }

    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }

    const data = await runRequest(
      () =>
        apiRequest(
          `/api/billing/invoices/${encodeURIComponent(invoiceId.trim())}/payments`,
          {
            method: "POST",
            body: JSON.stringify({
              amount,
              method: paymentMethod.trim(),
            }),
          }
        ),
      "Payment recorded."
    );

    if (data !== null) await loadInvoices();
  }

  async function loadOutstanding() {
    await runRequest(() => apiRequest("/api/billing/outstanding"));
  }

  async function loadRevenueReport() {
    await runRequest(() => apiRequest("/api/reports/revenue"));
  }

  async function loadPaymentsReport() {
    await runRequest(() => apiRequest("/api/reports/payments"));
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <main>
      <h1>Billing and Reports</h1>

      <section>
        <h2>Invoices</h2>
        <button type="button" onClick={loadInvoices} disabled={loading}>
          List invoices
        </button>
        {invoices !== null && <pre>{JSON.stringify(invoices, null, 2)}</pre>}
      </section>

      <section>
        <h2>Create invoice</h2>
        <form onSubmit={createInvoice}>
          <label htmlFor="invoice-json">Invoice JSON</label>
          <textarea
            id="invoice-json"
            rows={8}
            value={invoiceJson}
            onChange={(event) => setInvoiceJson(event.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            Create invoice
          </button>
        </form>
      </section>

      <section>
        <h2>View, cancel, or record payment</h2>

        <label>
          Invoice ID
          <input
            value={invoiceId}
            onChange={(event) => setInvoiceId(event.target.value)}
            required
          />
        </label>

        <button type="button" onClick={viewInvoice} disabled={loading}>
          View invoice
        </button>

        <button type="button" onClick={cancelInvoice} disabled={loading}>
          Cancel invoice
        </button>

        <form onSubmit={recordPayment}>
          <label>
            Payment amount
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              required
            />
          </label>

          <label>
            Payment method
            <input
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            Record payment
          </button>
        </form>
      </section>

      <section>
        <h2>Reports</h2>
        <button type="button" onClick={loadOutstanding} disabled={loading}>
          Outstanding invoices
        </button>
        <button type="button" onClick={loadRevenueReport} disabled={loading}>
          Revenue report
        </button>
        <button type="button" onClick={loadPaymentsReport} disabled={loading}>
          Payments report
        </button>
      </section>

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {output !== null && (
        <section>
          <h2>Latest response</h2>
          <pre>{JSON.stringify(output, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}