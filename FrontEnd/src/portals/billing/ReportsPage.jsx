import { useState } from "react";
import billingApi from "../../features/billing/api/billingApi";

export default function ReportsPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadReport(kind) {
    setLoading(true);
    setError("");
    try {
      const data = kind === "revenue"
        ? await billingApi.getRevenueReport({ start, end })
        : await billingApi.getPaymentReport({ start, end });
      setResult(data);
    } catch (requestError) {
      setError(requestError.message || "Could not load report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="billing-page">
      <h1>Billing reports</h1>
      <div className="billing-page-filters">
        <label>Start date<input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label>End date<input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <button type="button" disabled={loading} onClick={() => loadReport("revenue")}>Revenue report</button>
        <button type="button" disabled={loading} onClick={() => loadReport("payments")}>Payment report</button>
      </div>
      {error && <p role="alert">{error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </main>
  );
}
