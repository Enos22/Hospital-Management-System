import { useState } from "react";
import { useRecordPayment } from "../hooks/useBilling";

const PAYMENT_METHODS = [
  ["cash", "Cash"],
  ["card", "Card"],
  ["mobile_money", "Mobile money"],
  ["bank_transfer", "Bank transfer"],
  ["insurance", "Insurance"],
];

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Could not record the payment.";
}

export default function PaymentForm({ invoice, onSuccess, onCancel }) {
  const [amount, setAmount] = useState(String(invoice?.balance ?? ""));
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [formError, setFormError] = useState("");
  const paymentMutation = useRecordPayment();

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const invoiceId = invoice?.id;
    const balance = Number(invoice?.balance);
    const paymentAmount = Number(amount);

    if (invoiceId == null) {
      setFormError("A valid invoice is required to record a payment.");
      return;
    }

    if (
      !Number.isFinite(balance) ||
      balance <= 0 ||
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0 ||
      paymentAmount > balance
    ) {
      setFormError("Enter an amount greater than 0 and no more than the balance.");
      return;
    }

    paymentMutation.mutate(
      {
        invoiceId,
        amount: paymentAmount,
        method,
        reference: reference.trim() || undefined,
      },
      {
        onSuccess: (updatedInvoice) => onSuccess?.(updatedInvoice),
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  }

  const invoiceLabel =
    invoice?.invoice_number ?? `invoice #${invoice?.id ?? ""}`;

  return (
    <form className="invoice-payment-form" onSubmit={handleSubmit}>
      <h2>Record payment for {invoiceLabel}</h2>
      {formError && (
        <p className="invoice-table-error" role="alert">
          {formError}
        </p>
      )}
      <label>
        Amount
        <input
          type="number"
          name="amount"
          min="0.01"
          max={invoice?.balance}
          step="0.01"
          required
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setFormError("");
          }}
        />
      </label>
      <label>
        Payment method
        <select
          name="method"
          value={method}
          onChange={(event) => setMethod(event.target.value)}
        >
          {PAYMENT_METHODS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Reference (optional)
        <input
          type="text"
          name="reference"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
        />
      </label>
      <div className="invoice-payment-actions">
        <button type="submit" disabled={paymentMutation.isPending}>
          {paymentMutation.isPending ? "Recording…" : "Submit payment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={paymentMutation.isPending}
          >
            Close
          </button>
        )}
      </div>
    </form>
  );
}
