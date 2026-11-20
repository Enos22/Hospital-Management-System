/*
 * TODO: Present the signed-in patient's invoices and billing data.
 */
import { useBilling } from "../../features/billing/hooks/useBilling";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "Amount unavailable";
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) return "Amount unavailable";

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
}

export default function BillsPage() {
  const { invoices = [], loading, error } = useBilling();

  return (
    <main className="patient-page">
      <section className="page-header">
        <h1>My Bills</h1>
        <p>View your hospital invoices and payment information.</p>
      </section>

      {loading && <p>Loading bills...</p>}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {!loading && invoices.length === 0 && (
        <p>You currently have no invoices.</p>
      )}

      <section className="invoice-list">
        {invoices.map((invoice) => (
          <article className="invoice-card" key={invoice.id}>
            <h2>Invoice #{invoice.id}</h2>

            <p>
              <strong>Amount:</strong>{" "}
              {formatAmount(invoice.total_amount ?? invoice.total)}
            </p>

            <p>
              <strong>Status:</strong> {invoice.status || "Not available"}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {formatDate(invoice.created_at || invoice.invoice_date)}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
