import { useState } from "react";
import { useCreateInvoice } from "../hooks/useBilling";

function calculateTotals(items, taxRate, discount) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0,
  );
  const tax = subtotal * ((Number(taxRate) || 0) / 100);
  const discountAmount = Number(discount) || 0;

  return {
    subtotal,
    tax,
    total: Math.max(0, subtotal + tax - discountAmount),
  };
}

function formatAmount(amount) {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Could not create the invoice.";
}

export default function InvoiceForm({
  patientId,
  onSuccess,
  onCancel,
}) {
  const [patientIdInput, setPatientIdInput] = useState(
    patientId == null ? "" : String(patientId),
  );
  const [items, setItems] = useState([
    { description: "", quantity: "1", unit_price: "" },
  ]);
  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const createInvoiceMutation = useCreateInvoice();
  const totals = calculateTotals(items, taxRate, discount);

  function updateItem(index, field, value) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
    setFormError("");
    setSuccessMessage("");
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      { description: "", quantity: "1", unit_price: "" },
    ]);
  }

  function removeItem(index) {
    setItems((currentItems) =>
      currentItems.length > 1
        ? currentItems.filter((_item, itemIndex) => itemIndex !== index)
        : currentItems,
    );
    setFormError("");
    setSuccessMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const numericPatientId = Number(patientIdInput);
    const numericTaxRate = Number(taxRate);
    const numericDiscount = Number(discount);
    const normalizedItems = items.map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    }));

    if (!Number.isInteger(numericPatientId) || numericPatientId < 1) {
      setFormError("Enter a valid patient profile ID.");
      return;
    }

    if (
      normalizedItems.some(
        (item) =>
          !item.description ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          !Number.isFinite(item.unit_price) ||
          item.unit_price < 0,
      )
    ) {
      setFormError(
        "Each item needs a description, a whole-number quantity of at least 1, and a non-negative unit price.",
      );
      return;
    }

    if (
      !Number.isFinite(numericTaxRate) ||
      numericTaxRate < 0 ||
      numericTaxRate > 100
    ) {
      setFormError("Tax rate must be between 0 and 100.");
      return;
    }

    const subtotal = normalizedItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
    const taxedSubtotal = subtotal + subtotal * (numericTaxRate / 100);
    if (
      !Number.isFinite(numericDiscount) ||
      numericDiscount < 0 ||
      numericDiscount > taxedSubtotal
    ) {
      setFormError("Discount must be between 0 and the taxed subtotal.");
      return;
    }

    createInvoiceMutation.mutate(
      {
        patient_id: numericPatientId,
        items: normalizedItems,
        tax_rate: numericTaxRate,
        discount: numericDiscount,
      },
      {
        onSuccess: (invoice) => {
          setSuccessMessage("Invoice created successfully.");
          onSuccess?.(invoice);
        },
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  }

  return (
    <form className="invoice-form" onSubmit={handleSubmit}>
      <h2>Create invoice</h2>

      {formError && (
        <p className="invoice-form-error" role="alert">
          {formError}
        </p>
      )}
      {successMessage && (
        <p className="invoice-form-success" role="status">
          {successMessage}
        </p>
      )}

      <label>
        Patient profile ID
        <input
          type="number"
          name="patient_id"
          min="1"
          step="1"
          required
          readOnly={patientId != null}
          value={patientIdInput}
          onChange={(event) => {
            setPatientIdInput(event.target.value);
            setFormError("");
            setSuccessMessage("");
          }}
        />
      </label>

      <fieldset className="invoice-form-items">
        <legend>Invoice items</legend>
        {items.map((item, index) => (
          <div className="invoice-form-item" key={index}>
            <label>
              Description
              <input
                type="text"
                name={`items[${index}][description]`}
                required
                value={item.description}
                onChange={(event) =>
                  updateItem(index, "description", event.target.value)
                }
              />
            </label>
            <label>
              Quantity
              <input
                type="number"
                name={`items[${index}][quantity]`}
                min="1"
                step="1"
                required
                value={item.quantity}
                onChange={(event) =>
                  updateItem(index, "quantity", event.target.value)
                }
              />
            </label>
            <label>
              Unit price
              <input
                type="number"
                name={`items[${index}][unit_price]`}
                min="0"
                step="0.01"
                required
                value={item.unit_price}
                onChange={(event) =>
                  updateItem(index, "unit_price", event.target.value)
                }
              />
            </label>
            <span>
              Line total:{" "}
              {formatAmount(
                (Number(item.quantity) || 0) *
                  (Number(item.unit_price) || 0),
              )}
            </span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={createInvoiceMutation.isPending}
                aria-label={`Remove invoice item ${index + 1}`}
              >
                Remove item
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          disabled={createInvoiceMutation.isPending}
        >
          Add item
        </button>
      </fieldset>

      <label>
        Tax rate (%)
        <input
          type="number"
          name="tax_rate"
          min="0"
          max="100"
          step="0.01"
          required
          value={taxRate}
          onChange={(event) => {
            setTaxRate(event.target.value);
            setFormError("");
            setSuccessMessage("");
          }}
        />
      </label>
      <label>
        Discount
        <input
          type="number"
          name="discount"
          min="0"
          step="0.01"
          required
          value={discount}
          onChange={(event) => {
            setDiscount(event.target.value);
            setFormError("");
            setSuccessMessage("");
          }}
        />
      </label>

      <dl className="invoice-form-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatAmount(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>Tax</dt>
          <dd>{formatAmount(totals.tax)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatAmount(totals.total)}</dd>
        </div>
      </dl>

      <div className="invoice-form-actions">
        <button type="submit" disabled={createInvoiceMutation.isPending}>
          {createInvoiceMutation.isPending ? "Creating…" : "Create invoice"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={createInvoiceMutation.isPending}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
