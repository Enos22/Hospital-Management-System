/*
 * TODO: Present medicine inventory management for administrators.
 */
import { useEffect, useState } from "react";
import { getToken } from "../../lib/api/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

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
    if (!API_BASE_URL) {
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
    event.preventDefault();

    if (!medicineId.trim()) {
      setError("Enter a medicine ID.");
      return;
    }

    const data = await performRequest(() =>
      apiRequest(
        `/api/pharmacy/medicines/${encodeURIComponent(medicineId.trim())}`
      )
    );

    if (data !== null) setSelectedMedicine(data);
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

  return (
    <main>
      <h1>Pharmacy</h1>
      <p>Manage the medicine inventory.</p>

      <section>
        <h2>Medicines</h2>
        <button type="button" onClick={loadMedicines} disabled={loading}>
          Refresh medicines
        </button>
        {medicines !== null && (
          <pre>{JSON.stringify(medicines, null, 2)}</pre>
        )}
      </section>

      <section>
        <h2>Add medicine</h2>
        <form onSubmit={addMedicine}>
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

      <section>
        <h2>View, update, or delete a medicine</h2>

        <label>
          Medicine ID
          <input
            value={medicineId}
            onChange={(event) => setMedicineId(event.target.value)}
          />
        </label>

        <button type="button" onClick={viewMedicine} disabled={loading}>
          View medicine
        </button>

        {selectedMedicine !== null && (
          <pre>{JSON.stringify(selectedMedicine, null, 2)}</pre>
        )}

        <form onSubmit={updateMedicine}>
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

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </main>
  );
}