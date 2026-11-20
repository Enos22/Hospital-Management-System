/*
 * TODO: Present medical history when the patient's clinical profile is available.
 */
import { useMedicalRecords } from "../../features/medical-records/hooks/useMedicalRecords";

function formatRecordDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MedicalHistoryPage() {
  const { records, medicalRecords, loading, error } = useMedicalRecords();
  const recordList = records || medicalRecords || [];

  return (
    <main className="patient-page">
      <section className="page-header">
        <h1>Medical History</h1>
        <p>Review your medical records and treatment history.</p>
      </section>

      {loading && <p>Loading medical history...</p>}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {!loading && recordList.length === 0 && (
        <p>No medical records are currently available.</p>
      )}

      <section className="medical-record-list">
        {recordList.map((record) => (
          <article className="medical-record-card" key={record.id}>
            <h2>{record.diagnosis || "Medical Record"}</h2>

            <p>
              <strong>Treatment:</strong> {record.treatment || "Not provided"}
            </p>

            <p>
              <strong>Doctor ID:</strong> {record.doctor_id || "Not available"}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {formatRecordDate(record.created_at || record.record_date)}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}