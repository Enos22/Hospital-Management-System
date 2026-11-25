import { useState } from "react";
import InvoiceForm from "../../features/billing/components/InvoiceForm";
import InvoiceTable from "../../features/billing/components/InvoiceTable";

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("");

  return (
    <main className="billing-page">
      <header className="billing-page-header">
        <div>
          <h1>Invoices</h1>
          <p>Create invoices, record payments, and manage billing status.</p>
        </div>
        <button type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Close form" : "Create invoice"}
        </button>
      </header>
      {showForm && (
        <InvoiceForm
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}
      <label>
        Status
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partially paid</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <InvoiceTable status={status || undefined} canManage showPatient />
    </main>
  );
}
