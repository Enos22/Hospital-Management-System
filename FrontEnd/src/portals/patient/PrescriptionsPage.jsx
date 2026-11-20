/*
 * TODO: Present prescriptions belonging to the signed-in patient.
 */
import { usePrescriptions } from "../../features/prescriptions/hooks/usePrescriptions";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PrescriptionsPage() {
  const { prescriptions = [], loading, error } = usePrescriptions();

  return (
    <main className="patient-page">
      <section className="page-header">
        <h1>My Prescriptions</h1>
        <p>View medication prescribed by your doctors.</p>
      </section>

      {loading && <p>Loading prescriptions...</p>}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {!loading && prescriptions.length === 0 && (
        <p>You currently have no prescriptions.</p>
      )}

      <section className="prescription-list">
        {prescriptions.map((prescription) => (
          <article className="prescription-card" key={prescription.id}>
            <h2>Medicine #{prescription.medicine_id || "Not specified"}</h2>

            <p>
              <strong>Dosage:</strong> {prescription.dosage || "Not provided"}
            </p>

            <p>
              <strong>Frequency:</strong>{" "}
              {prescription.frequency || "Not provided"}
            </p>

            <p>
              <strong>Duration:</strong>{" "}
              {prescription.duration || "Not provided"}
            </p>

            <p>
              <strong>Date issued:</strong>{" "}
              {formatDate(prescription.created_at)}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}