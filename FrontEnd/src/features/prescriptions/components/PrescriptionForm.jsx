import React, { useState } from "react";

function PrescriptionForm({
  patients = [],
  doctors = [],
  medicines = [],
  initialValues = {},
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    patient_id: initialValues.patient_id || "",
    doctor_id: initialValues.doctor_id || "",
    medicine_id: initialValues.medicine_id || "",
    dosage: initialValues.dosage || "",
    frequency: initialValues.frequency || "",
    duration: initialValues.duration || "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const { patient_id, doctor_id, medicine_id, dosage, frequency, duration } =
      formData;

    if (
      !patient_id ||
      !doctor_id ||
      !medicine_id ||
      !dosage.trim() ||
      !frequency.trim() ||
      !duration.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await onSubmit({
        patient_id: Number(patient_id),
        doctor_id: Number(doctor_id),
        medicine_id: Number(medicine_id),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        duration: duration.trim(),
      });
    } catch (err) {
      setError(err.message || "Unable to save prescription.");
    }
  };

  const getName = (item) =>
    item.name || item.full_name || item.username || `ID: ${item.id}`;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Prescription</h2>

      {error && <p role="alert">{error}</p>}

      <label htmlFor="patient_id">Patient</label>
      <select
        id="patient_id"
        name="patient_id"
        value={formData.patient_id}
        onChange={handleChange}
        required
      >
        <option value="">Select patient</option>
        {patients.map((patient) => (
          <option key={patient.patient_id} value={patient.patient_id}>
            {getName(patient)}
          </option>
        ))}
      </select>

      <label htmlFor="doctor_id">Doctor</label>
      <select
        id="doctor_id"
        name="doctor_id"
        value={formData.doctor_id}
        onChange={handleChange}
        required
      >
        <option value="">Select doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor.doctor_id} value={doctor.doctor_id}>
            {getName(doctor)}
          </option>
        ))}
      </select>

      <label htmlFor="medicine_id">Medicine</label>
      <select
        id="medicine_id"
        name="medicine_id"
        value={formData.medicine_id}
        onChange={handleChange}
        required
      >
        <option value="">Select medicine</option>
        {medicines.map((medicine) => (
          <option key={medicine.id} value={medicine.id}>
            {getName(medicine)}
          </option>
        ))}
      </select>

      <label htmlFor="dosage">Dosage</label>
      <input
        id="dosage"
        name="dosage"
        type="text"
        value={formData.dosage}
        onChange={handleChange}
        placeholder="e.g. 500mg"
        required
      />

      <label htmlFor="frequency">Frequency</label>
      <input
        id="frequency"
        name="frequency"
        type="text"
        value={formData.frequency}
        onChange={handleChange}
        placeholder="e.g. Twice daily"
        required
      />

      <label htmlFor="duration">Duration</label>
      <input
        id="duration"
        name="duration"
        type="text"
        value={formData.duration}
        onChange={handleChange}
        placeholder="e.g. 7 days"
        required
      />

      <button
        type="submit"
        disabled={
          isSubmitting ||
          patients.length === 0 ||
          doctors.length === 0 ||
          medicines.length === 0
        }
      >
        {isSubmitting ? "Saving..." : "Save Prescription"}
      </button>
    </form>
  );
}

export default PrescriptionForm;