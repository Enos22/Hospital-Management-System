/*
 * TODO: Present searchable medicine inventory for doctors.
 */
import { useEffect, useMemo, useState } from "react";
import { get } from "../../lib/api/client";

const PAGE_SIZE = 8;

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMedicines() {
      setLoading(true);
      setError("");

      try {
        const response = await get("/api/pharmacy/medicines");
        const list = Array.isArray(response)
          ? response
          : response?.medicines || response?.data;

        if (!Array.isArray(list)) {
          throw new Error("Invalid medicine inventory response.");
        }

        if (active) setMedicines(list);
      } catch (err) {
        if (active) setError(err.message || "Unable to load medicine inventory.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMedicines();
    return () => {
      active = false;
    };
  }, []);

  const filteredMedicines = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return medicines;

    return medicines.filter((medicine) => {
      const name = (medicine.name || medicine.medicine_name || "").toLowerCase();
      const category = (medicine.category || "").toLowerCase();
      return name.includes(query) || category.includes(query);
    });
  }, [medicines, search]);

  const totalPages = Math.max(1, Math.ceil(filteredMedicines.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleMedicines = filteredMedicines.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  if (loading) {
    return <p className="loading-state">Loading medicine inventory...</p>;
  }

  return (
    <section className="doctor-pharmacy-page">
      <div className="page-header">
        <div>
          <h1>Pharmacy</h1>
          <p>Search and view available medicines.</p>
        </div>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <div className="page-filters">
        <input
          type="search"
          placeholder="Search medicines by name or category..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="medicine-list">
        {visibleMedicines.length === 0 ? (
          <p className="empty-state">No medicines found.</p>
        ) : (
          visibleMedicines.map((medicine) => {
            const medicineName = medicine.name || medicine.medicine_name || "Unnamed medicine";

            return (
              <article className="medicine-card" key={medicine.id}>
                <h3>{medicineName}</h3>
                <p><strong>Medicine ID:</strong> {medicine.id}</p>
                <p><strong>Category:</strong> {medicine.category || "Not specified"}</p>
                <p><strong>Description:</strong> {medicine.description || "No description available"}</p>
                <p><strong>Quantity:</strong> {medicine.quantity ?? "Not available"}</p>
                <p><strong>Price:</strong> {medicine.price ?? "Not available"}</p>
              </article>
            );
          })
        )}
      </div>

      {filteredMedicines.length > PAGE_SIZE && (
        <div className="pagination">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}