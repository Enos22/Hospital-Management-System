/*
 * TODO: Present the searchable patient-account directory.
 */
import { useEffect, useMemo, useState } from "react";
import { get } from "../../lib/api/client";

const PAGE_SIZE = 8;

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPatients() {
      setLoading(true);
      setError("");

      try {
        const response = await get("/patients");
        const list = Array.isArray(response)
          ? response
          : response?.patients || response?.data;

        if (!Array.isArray(list)) {
          throw new Error("Invalid patient data received.");
        }

        if (active) setPatients(list);
      } catch (err) {
        if (active) setError(err.message || "Unable to load patients.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPatients();
    return () => {
      active = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return patients;

    return patients.filter((patient) => {
      const name = (patient.username || patient.name || "").toLowerCase();
      const email = (patient.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [patients, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const visiblePatients = filteredPatients.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  if (loading) {
    return <p className="loading-state">Loading patients...</p>;
  }

  return (
    <section className="doctor-patients-page">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>View and search registered patient accounts.</p>
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
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="patients-list">
        {visiblePatients.length === 0 ? (
          <p className="empty-state">No patients found.</p>
        ) : (
          visiblePatients.map((patient) => (
            <article className="patient-card" key={patient.id}>
              <div>
                <h3>{patient.username || patient.name || "Unnamed patient"}</h3>
                <p>{patient.email || "No email available"}</p>
                <p>Account ID: {patient.id}</p>
              </div>

              <a href={`/doctor/patients/${patient.id}`}>View details</a>
            </article>
          ))
        )}
      </div>

      {filteredPatients.length > PAGE_SIZE && (
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