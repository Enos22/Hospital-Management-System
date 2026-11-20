import React from "react";

function PrescriptionCard({ prescription, onView }) {
  if (!prescription) return null;

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString();
  };

  return (
    <article className="prescription-card">
      <h3>Prescription #{prescription.id}</h3>

      <p><strong>Patient ID:</strong> {prescription.patient_id}</p>
      <p><strong>Doctor ID:</strong> {prescription.doctor_id}</p>
      <p><strong>Medicine ID:</strong> {prescription.medicine_id}</p>
      <p><strong>Dosage:</strong> {prescription.dosage}</p>
      <p><strong>Frequency:</strong> {prescription.frequency}</p>
      <p><strong>Duration:</strong> {prescription.duration}</p>
      <p><strong>Date created:</strong> {formatDate(prescription.created_at)}</p>

      {onView && (
        <button type="button" onClick={() => onView(prescription)}>
          View Details
        </button>
      )}
    </article>
  );
}

export default PrescriptionCard;