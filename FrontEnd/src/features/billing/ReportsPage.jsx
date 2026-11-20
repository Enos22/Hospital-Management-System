import { useState } from "react";
import {
  usePaymentReport,
  useRevenueReport,
} from "./hooks/useBilling";

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

function ReportError({ error, onRetry }) {
  return (
    <div role="alert">
      <p>Report could not be loaded: {getErrorMessage(error)}</p>
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export default function ReportsPage() {
  const [dates, setDates] = useState({ start: "", end: "" });
  const {
    data: revenue,
    isPending: revenuePending,
    isError: revenueError,
    error: revenueErrorDetails,
    refetch: refetchRevenue,
    isFetching: revenueFetching,
  } = useRevenueReport(dates);
  const {
    data: payments,
    isPending: paymentsPending,
    isError: paymentsError,
    error: paymentsErrorDetails,
    refetch: refetchPayments,
    isFetching: paymentsFetching,
  } = usePaymentReport(dates);

  function updateDate(field, value) {
    setDates((currentDates) => ({ ...currentDates, [field]: value }));
  }

  const dateRangeInvalid =
    dates.start && dates.end && dates.start >= dates.end;

  return (
    <main className="billing-page">
      <header className="billing-page-header">
        <div>
          <h1>Billing reports</h1>
          <p>Review invoice revenue and payments received.</p>
        </div>
      </header>

      <form
        className="billing-page-filters"
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          Start date
          <input
            type="date"
            name="start"
            value={dates.start}
            max={dates.end || undefined}
            onChange={(event) => updateDate("start", event.target.value)}
          />
        </label>
        <label>
          End date
          <input
            type="date"
            name="end"
            value={dates.end}
            min={dates.start || undefined}
            onChange={(event) => updateDate("end", event.target.value)}
          />
        </label>
        {(dates.start || dates.end) && (
          <button
            type="button"
            onClick={() => setDates({ start: "", end: "" })}
          >
            Clear dates
          </button>
        )}
      </form>

      {dateRangeInvalid && (
        <p role="alert">Start date must be before the end date.</p>
      )}

      <section className="billing-report-section" aria-labelledby="revenue-heading">
        <h2 id="revenue-heading">Revenue</h2>
        {revenuePending ? (
          <p role="status">Loading revenue report…</p>
        ) : revenueError ? (
          <ReportError
            error={revenueErrorDetails}
            onRetry={() => refetchRevenue()}
          />
        ) : (
          <>
            {revenueFetching && <p role="status">Refreshing revenue report…</p>}
            <dl className="billing-report-summary">
              <div>
                <dt>Report period</dt>
                <dd>
                  {revenue?.start ?? "—"} – {revenue?.end ?? "—"}
                </dd>
              </div>
              <div>
                <dt>Invoices issued</dt>
                <dd>{revenue?.invoices_issued ?? 0}</dd>
              </div>
              <div>
                <dt>Total invoiced</dt>
                <dd>{formatAmount(revenue?.total_invoiced)}</dd>
              </div>
              <div>
                <dt>Total collected</dt>
                <dd>{formatAmount(revenue?.total_collected)}</dd>
              </div>
              <div>
                <dt>Total outstanding</dt>
                <dd>{formatAmount(revenue?.total_outstanding)}</dd>
              </div>
            </dl>
          </>
        )}
      </section>

      <section className="billing-report-section" aria-labelledby="payments-heading">
        <h2 id="payments-heading">Payments</h2>
        {paymentsPending ? (
          <p role="status">Loading payment report…</p>
        ) : paymentsError ? (
          <ReportError
            error={paymentsErrorDetails}
            onRetry={() => refetchPayments()}
          />
        ) : (
          <>
            {paymentsFetching && (
              <p role="status">Refreshing payment report…</p>
            )}
            <dl className="billing-report-summary">
              <div>
                <dt>Number of payments</dt>
                <dd>{payments?.number_of_payments ?? 0}</dd>
              </div>
              <div>
                <dt>Total payments</dt>
                <dd>{formatAmount(payments?.total_amount)}</dd>
              </div>
            </dl>
            <div className="invoice-table-scroll">
              <table className="invoice-table">
                <caption>Payments by method</caption>
                <thead>
                  <tr>
                    <th scope="col">Method</th>
                    <th scope="col">Payment count</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(payments?.by_method ?? {}).map(
                    ([method, summary]) => (
                      <tr key={method}>
                        <th scope="row">{method.replaceAll("_", " ")}</th>
                        <td>{summary.count}</td>
                        <td>{formatAmount(summary.total)}</td>
                      </tr>
                    ),
                  )}
                  {Object.keys(payments?.by_method ?? {}).length === 0 && (
                    <tr>
                      <td colSpan={3}>No payments found for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
