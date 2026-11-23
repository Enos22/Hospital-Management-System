import { useOutstandingInvoices } from "./hooks/useBilling";
import { formatDate } from "../../lib/format/FormatDate.js";

function formatAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";
}


function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function OutstandingPage() {
  const {
    data: outstanding,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useOutstandingInvoices();

  if (isPending) {
    return (
      <main className="billing-page" aria-busy="true">
        <h1>Outstanding invoices</h1>
        <p role="status">Loading outstanding invoices…</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="billing-page">
        <h1>Outstanding invoices</h1>
        <p role="alert">
          Outstanding invoices could not be loaded: {getErrorMessage(error)}
        </p>
        <button type="button" onClick={() => refetch()}>
          Try again
        </button>
      </main>
    );
  }

  const invoices = Array.isArray(outstanding?.invoices)
    ? outstanding.invoices
    : [];

  return (
    <main className="billing-page">
      <header className="billing-page-header">
        <div>
          <h1>Outstanding invoices</h1>
          <p>Invoices with an unpaid balance.</p>
        </div>
        <div className="billing-summary" aria-live="polite">
          <span>Total outstanding</span>
          <strong>{formatAmount(outstanding?.total_outstanding)}</strong>
        </div>
      </header>

      {isFetching && <p role="status">Refreshing outstanding invoices…</p>}

      <div className="invoice-table-scroll">
        <table className="invoice-table">
          <caption>Outstanding invoices</caption>
          <thead>
            <tr>
              <th scope="col">Invoice</th>
              <th scope="col">Patient ID</th>
              <th scope="col">Issued</th>
              <th scope="col">Due</th>
              <th scope="col">Total</th>
              <th scope="col">Paid</th>
              <th scope="col">Balance</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <th scope="row">
                  {invoice.invoice_number ?? `Invoice #${invoice.id}`}
                </th>
                <td>{invoice.patient_id ?? "—"}</td>
                <td>{formatDate(invoice.issued_at)}</td>
                <td>{formatDate(invoice.due_date)}</td>
                <td>{formatAmount(invoice.total_amount)}</td>
                <td>{formatAmount(invoice.amount_paid)}</td>
                <td>{formatAmount(invoice.balance)}</td>
                <td>
                  <span
                    className={`invoice-status invoice-status-${String(
                      invoice.status ?? "unknown",
                    ).toLowerCase()}`}
                  >
                    {invoice.status ?? "Unknown"}
                  </span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={8}>There are no outstanding invoices.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
