/*
 * TODO: Present medicine inventory management for administrators.
 */
import { useEffect, useState } from "react";
import { getToken } from "../../lib/api/client";
import { formatCurrency } from "../../lib/format/FormatCurrency.js";

const API_BASE_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState(null);
  const [medicineId, setMedicineId] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");

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

  async function performRequest(request, successMessage = "") {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await request();
      if (successMessage) setMessage(successMessage);
      return data;
    } catch (err) {
      setError(err.message || "Something went wrong.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loadMedicines() {
    const data = await performRequest(() =>
      apiRequest("/api/pharmacy/medicines")
    );

    if (data !== null) setMedicines(data);
  }

  async function addMedicine(event) {
    event.preventDefault();

    const data = await performRequest(
      () =>
        apiRequest("/api/pharmacy/medicines", {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            price: Number(price),
            stock_quantity: Number(stockQuantity),
          }),
        }),
      "Medicine added."
    );

    if (data !== null) {
      setName("");
      setPrice("");
      setStockQuantity("");
      await loadMedicines();
    }
  }

  async function viewMedicine(event) {
    event?.preventDefault();

    const id = typeof event === "string" ? event : medicineId.trim();
    if (!id) {
      setError("Enter a medicine ID.");
      return;
    }

    setMedicineId(id);
    const data = await performRequest(() =>
      apiRequest(
        `/api/pharmacy/medicines/${encodeURIComponent(id)}`
      )
    );

    if (data !== null) setSelectedMedicine(data?.medicine ?? data);
  }

  async function updateMedicine(event) {
    event.preventDefault();

    if (!medicineId.trim()) {
      setError("Enter a medicine ID.");
      return;
    }

    const payload = {};
    if (price !== "") payload.price = Number(price);
    if (stockQuantity !== "") {
      payload.stock_quantity = Number(stockQuantity);
    }

    if (Object.keys(payload).length === 0) {
      setError("Enter a price or stock quantity to update.");
      return;
    }

    const data = await performRequest(
      () =>
        apiRequest(
          `/api/pharmacy/medicines/${encodeURIComponent(medicineId.trim())}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        ),
      "Medicine updated."
    );

    if (data !== null) {
      setSelectedMedicine(data);
      setPrice("");
      setStockQuantity("");
      await loadMedicines();
    }
  }

  async function deleteMedicine() {
    if (!medicineId.trim()) {
      setError("Enter a medicine ID.");
      return;
    }

    const confirmation = window.prompt(
      'Type "DELETE" to confirm deleting this medicine:'
    );

    if (confirmation !== "DELETE") return;

    const data = await performRequest(
      () =>
        apiRequest(
          `/api/pharmacy/medicines/${encodeURIComponent(medicineId.trim())}`,
          { method: "DELETE" }
        ),
      "Medicine deleted."
    );

    if (data !== null) {
      setSelectedMedicine(null);
      await loadMedicines();
    }
  }

  useEffect(() => {
    loadMedicines();
  }, []);

  const medicineRows = Array.isArray(medicines)
    ? medicines
    : Array.isArray(medicines?.medicines)
      ? medicines.medicines
      : [];
  const inventoryCount = medicines?.metadata?.total_items ?? medicineRows.length;
  const lowStockCount = medicineRows.filter(
    (medicine) => Number(medicine.stock_quantity) > 0 && Number(medicine.stock_quantity) <= 10
  ).length;

  const selectedMedicineDetails = selectedMedicine?.medicine ?? selectedMedicine;

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
        alignItems: "start",
        gap: "18px",
      }}
    >
      <header style={{ gridColumn: "1 / -1" }}>
        <p style={{ margin: "0 0 7px", color: "#4967c8", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Inventory management
        </p>
        <h1 style={{ margin: 0 }}>Pharmacy</h1>
        <p style={{ margin: "8px 0 0", color: "#68758a" }}>
          Keep medicine stock, pricing, and availability up to date.
        </p>
      </header>

      <section style={{ gridColumn: "1 / -1", padding: "20px", border: "1px solid #e2e7ef", borderRadius: "16px", background: "#fff", boxShadow: "0 2px 8px rgba(31, 46, 74, 0.045)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "17px" }}>
          <div>
            <h2 style={{ margin: 0 }}>Medicine inventory</h2>
            <p style={{ margin: "5px 0 0", color: "#68758a", fontSize: "0.88rem" }}>
              {loading ? "Updating inventory…" : `${inventoryCount} ${inventoryCount === 1 ? "medicine" : "medicines"}${lowStockCount ? ` · ${lowStockCount} low on stock` : ""}`}
            </p>
          </div>
          <button type="button" onClick={loadMedicines} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh inventory"}
          </button>
        </div>

        {medicineRows.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", whiteSpace: "nowrap" }}>
              <thead>
                <tr>
                  {["Medicine", "Price", "In stock", "Availability", ""].map((heading) => (
                    <th key={heading} style={{ padding: "12px 14px", borderBottom: "1px solid #e2e7ef", background: "#f7f8fc", color: "#68758a", fontSize: "0.72rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medicineRows.map((medicine, index) => {
                  const stock = Number(medicine.stock_quantity);
                  const isOutOfStock = stock <= 0;
                  const isLowStock = !isOutOfStock && stock <= 10;

                  return (
                    <tr key={medicine.id ?? `${medicine.name}-${index}`}>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid #edf0f5" }}>
                        <strong style={{ display: "block", color: "#202b3d" }}>{medicine.name ?? "Unnamed medicine"}</strong>
                        <span style={{ display: "block", marginTop: "3px", color: "#8a96a8", fontSize: "0.75rem" }}>ID: {medicine.id ?? "—"}</span>
                      </td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid #edf0f5", color: "#394760", fontWeight: 700 }}>
                        {formatCurrency(medicine.price)}
                      </td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid #edf0f5", color: "#394760" }}>
                        {Number.isFinite(stock) ? stock : "—"}
                      </td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid #edf0f5" }}>
                        <span style={{
                          display: "inline-flex",
                          padding: "5px 10px",
                          borderRadius: "999px",
                          background: isOutOfStock ? "#fff0f1" : isLowStock ? "#fff5e8" : "#edf4ff",
                          color: isOutOfStock ? "#a53d4a" : isLowStock ? "#99642c" : "#3d6399",
                          fontSize: "0.75rem",
                          fontWeight: 750,
                        }}>
                          {isOutOfStock ? "Out of stock" : isLowStock ? "Low stock" : "In stock"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 14px", borderBottom: "1px solid #edf0f5" }}>
                        <button
                          type="button"
                          onClick={() => viewMedicine(String(medicine.id))}
                          disabled={medicine.id == null || loading}
                          style={{ minHeight: "33px", padding: "6px 10px", border: "1px solid #d5dcf2", borderRadius: "8px", background: "#f5f6ff", color: "#354fae", fontSize: "0.77rem", fontWeight: 700 }}
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: 0, padding: "22px", border: "1px dashed #d3dbe7", borderRadius: "12px", background: "#fafbfe", color: "#68758a", textAlign: "center" }}>
            {loading ? "Loading medicines…" : medicines === null ? "Inventory has not loaded yet." : "No medicines have been added to the inventory."}
          </p>
        )}
      </section>

      <section style={{ gridColumn: "span 6", padding: "20px", border: "1px solid #e2e7ef", borderRadius: "16px", background: "#fff", boxShadow: "0 2px 8px rgba(31, 46, 74, 0.045)" }}>
        <h2>Add medicine</h2>
        <form onSubmit={addMedicine} style={{ display: "grid", gap: "14px" }}>
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>

          <label>
            Stock quantity
            <input
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            Add medicine
          </button>
        </form>
      </section>

      <section style={{ gridColumn: "span 6", padding: "20px", border: "1px solid #e2e7ef", borderRadius: "16px", background: "#fff", boxShadow: "0 2px 8px rgba(31, 46, 74, 0.045)" }}>
        <h2>View, update, or delete a medicine</h2>

        <form onSubmit={viewMedicine} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "end", gap: "12px", marginBottom: "14px" }}>
          <label>
            Medicine ID
            <input
              value={medicineId}
              onChange={(event) => setMedicineId(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>Find medicine</button>
        </form>

        {selectedMedicineDetails !== null && selectedMedicineDetails !== undefined && (
          <div style={{ margin: "14px 0", padding: "16px", border: "1px solid #e2e7ef", borderRadius: "12px", background: "#f8f9fc" }}>
            <h3 style={{ margin: "0 0 12px", color: "#202b3d", fontSize: "1rem" }}>
              {selectedMedicineDetails.name ?? "Medicine details"}
            </h3>
            <dl style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", margin: 0 }}>
              {[
                ["Medicine ID", selectedMedicineDetails.id],
                ["Price", selectedMedicineDetails.price == null ? null : formatCurrency(selectedMedicineDetails.price)],
                ["Stock quantity", selectedMedicineDetails.stock_quantity],
                ["Description", selectedMedicineDetails.description],
              ].filter(([, value]) => value != null && value !== "").map(([label, value]) => (
                <div key={label}>
                  <dt style={{ color: "#68758a", fontSize: "0.76rem" }}>{label}</dt>
                  <dd style={{ margin: "3px 0 0", color: "#202b3d", fontWeight: 650 }}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <form onSubmit={updateMedicine} style={{ display: "grid", gap: "14px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #edf0f5" }}>
          <label>
            New price
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>

          <label>
            New stock quantity
            <input
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
            />
          </label>

          <button type="submit" disabled={loading}>
            Update medicine
          </button>
        </form>

        <button type="button" onClick={deleteMedicine} disabled={loading}>
          Delete medicine
        </button>
      </section>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </main>
  );
}