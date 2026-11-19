/*
 * TODO: Render a medical record without mixing user and patient profile IDs.
 */
function formatRecordDate(value) {
  if (!value) return "Date unavailable";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MedicalRecordCard({ record = {} }) {
  const { id, diagnosis, treatment, record_date, created_at } = record;
  const displayDate = formatRecordDate(record_date || created_at);

  return (
    <article className="medical-record-card" data-record-id={id}>
      <div className="medical-record-header">
        <div>
          <h3>{diagnosis || "Diagnosis unavailable"}</h3>
          <p>
            <strong>Record date:</strong> {displayDate}
          </p>
        </div>
      </div>

      <div className="medical-record-details">
        <h4>Treatment</h4>
        <p>{treatment || "No treatment details available."}</p>
      </div>
    </article>
  );
}