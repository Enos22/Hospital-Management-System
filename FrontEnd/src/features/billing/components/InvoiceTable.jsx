import { useState } from "react";
import { useCancelInvoice, useInvoices } from "../hooks/useBilling";
import PaymentForm from "./PaymentForm";
import { formatDate } from "../../../lib/format/FormatDate.js";

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

export default function InvoiceTable({
  patientId,
  status,
  canManage = false,
  showPatient = patientId == null,
}) {
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [actionError, setActionError] = useState("");
  const { data: invoices, isPending, isError, error, refetch, isFetching } =
    useInvoices({ patient_id: patientId, status });
  const cancelMutation = useCancelInvoice();

  function startPayment(invoice) {
    setActionError("");
    setPaymentInvoice(invoice);
  }

  function handleCancel(invoice) {
    if (!window.confirm(`Cancel invoice ${invoice.invoice_number ?? invoice.id}?`)) {
      return;
    }

    setActionError("");
    cancelMutation.mutate(invoice.id, {
      onError: (mutationError) =>
        setActionError(getErrorMessage(mutationError)),
    });
  }

  if (isPending) {
    return <p role="status">Loading invoices…</p>;
  }

  if (isError) {
    return (
      <div role="alert">
        <p>Invoices could not be loaded: {getErrorMessage(error)}</p>
        <button type="button" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

  const invoiceRows = Array.isArray(invoices) ? invoices : [];

  return (
    <section className="invoice-table-section" aria-label="Invoices">
      {actionError && (
        <p className="invoice-table-error" role="alert">
          {actionError}
        </p>
      )}

      <div className="invoice-table-scroll">
        <table className="invoice-table">
          <caption>Invoices</caption>
          <thead>
            <tr>
              <th scope="col">Invoice</th>
              {showPatient && <th scope="col">Patient ID</th>}
              <th scope="col">Issued</th>
              <th scope="col">Due</th>
              <th scope="col">Total</th>
              <th scope="col">Paid</th>
              <th scope="col">Balance</th>
              <th scope="col">Status</th>
              {canManage && <th scope="col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {invoiceRows.map((invoice) => {
              const isPayable =
                ["unpaid", "partial"].includes(
                  String(invoice.status).toLowerCase(),
                ) && Number(invoice.balance) > 0;
              const canCancel =
                String(invoice.status).toLowerCase() === "unpaid" &&
                Number(invoice.amount_paid) <= 0;

              return (
                <tr key={invoice.id}>
                  <th scope="row">
                    {invoice.invoice_number ?? `Invoice #${invoice.id}`}
                  </th>
                  {showPatient && <td>{invoice.patient_id ?? "—"}</td>}
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
                  {canManage && (
                    <td>
                      <div className="invoice-actions">
                        {isPayable && (
                          <button
                            type="button"
                            onClick={() => startPayment(invoice)}
                            disabled={
                              Boolean(paymentInvoice) ||
                              cancelMutation.isPending
                            }
                          >
                            Record payment
                          </button>
                        )}
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => handleCancel(invoice)}
                            disabled={
                              Boolean(paymentInvoice) ||
                              cancelMutation.isPending
                            }
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {invoiceRows.length === 0 && (
              <tr>
                <td colSpan={canManage ? (showPatient ? 9 : 8) : showPatient ? 8 : 7}>
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFetching && <p role="status">Refreshing invoices…</p>}

      {canManage && paymentInvoice && (
        <PaymentForm
          invoice={paymentInvoice}
          onSuccess={() => setPaymentInvoice(null)}
          onCancel={() => setPaymentInvoice(null)}
        />
      )}
    </section>
  );
}
