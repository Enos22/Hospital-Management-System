import { useState } from "react";
import InvoiceForm from "./components/InvoiceForm";
import InvoiceTable from "./components/InvoiceTable";

const INVOICE_STATUSES = [
  ["", "All statuses"],
  ["unpaid", "Unpaid"],
  ["partial", "Partially paid"],
  ["paid", "Paid"],
  ["cancelled", "Cancelled"],
];

export default function InvoicesPage() {
  const [status, setStatus] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  return (
    <main className="billing-page">
      <header className="billing-page-header">
        <div>
          <h1>Invoices</h1>
          <p>Review and manage patient invoices and payments.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((currentlyCreating) => !currentlyCreating)}
          aria-expanded={isCreating}
        >
          {isCreating ? "Close invoice form" : "Create invoice"}
        </button>
      </header>

      {isCreating && (
        <InvoiceForm
          onSuccess={() => setIsCreating(false)}
          onCancel={() => setIsCreating(false)}
        />
      )}

      <div className="billing-page-filters">
        <label>
          Filter by status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {INVOICE_STATUSES.map(([value, label]) => (
              <option key={value || "all"} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <InvoiceTable
        status={status || undefined}
        canManage
        showPatient
      />
    </main>
  );
}
