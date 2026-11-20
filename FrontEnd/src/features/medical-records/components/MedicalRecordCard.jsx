import React from "react";

function MedicalRecordCard({ record, onView }) {
  if (!record) return null;

  return (
    <div className="medical-record-card">
      <div className="medical-record-header">
        <h3>{record.diagnosis || "Medical Record"}</h3>
        <span>{record.created_at
          ? new Date(record.created_at).toLocaleDateString()
          : "Date unavailable"}
        </span>
      </div>

      <div className="medical-record-details">
        <p>
          <strong>Patient ID:</strong> {record.patient_id ?? "Unavailable"}
        </p>

        <p>
          <strong>Treatment:</strong> {record.treatment || "Not provided"}
        </p>
      </div>

      {onView && (
        <button type="button" onClick={() => onView(record)}>
          View Details
        </button>
      )}
    </div>
  );
}

export default MedicalRecordCard;