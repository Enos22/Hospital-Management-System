import { useAuth } from "../../lib/auth/AuthContext.jsx";
import { usePatientMedicalHistory } from "../../features/medical-records/hooks/useMedicalRecords";
import { formatDate as formatRecordDate } from "../../lib/format/FormatDate.js";

export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const patientId = user?.patient_id;
  const { history, isLoading, error } = usePatientMedicalHistory(patientId);

  const errorMessage =
    typeof error === "string"
      ? error
      : error?.message || "Unable to load medical history.";

  if (!patientId) {
    return (
      <main className="patient-page">
        <section className="page-header">
          <h1>Medical History</h1>
          <p>Review your medical records and treatment history.</p>
        </section>
        <p className="error-message" role="alert">
          Your patient profile is not available. Please contact the administrator.
        </p>
      </main>
    );
  }

  return (
    <main className="patient-page">
      <section className="page-header">
        <h1>Medical History</h1>
        <p>Review your medical records and treatment history.</p>
      </section>

      {isLoading && <p>Loading medical history...</p>}

      {error && (
        <p className="error-message" role="alert">
          {errorMessage}
        </p>
      )}

      {!isLoading && !error && history.length === 0 && (
        <p>No medical records are currently available.</p>
      )}

      <section className="medical-record-list">
        {history.map((record) => (
          <article className="medical-record-card" key={record.id}>
            <h2>{record.diagnosis || "Medical Record"}</h2>

            <p>
              <strong>Treatment:</strong>{" "}
              {record.treatment || "Not provided"}
            </p>

            <p>
              <strong>Doctor ID:</strong>{" "}
              {record.doctor_id || "Not available"}
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