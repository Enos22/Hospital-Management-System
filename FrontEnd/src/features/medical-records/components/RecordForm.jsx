import React, { useState } from "react";

function RecordForm({
  patients = [],
  initialValues = {},
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    patient_id: initialValues.patient_id || "",
    diagnosis: initialValues.diagnosis || "",
    treatment: initialValues.treatment || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = "Please select a patient.";
    }

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = "Diagnosis is required.";
    }

    if (!formData.treatment.trim()) {
      newErrors.treatment = "Treatment is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    if (!onSubmit) return;

    await onSubmit({
      patient_id: Number(formData.patient_id),
      diagnosis: formData.diagnosis.trim(),
      treatment: formData.treatment.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>
        {initialValues.id ? "Edit Medical Record" : "Create Medical Record"}
      </h2>

      <label htmlFor="patient_id">Patient</label>

      <select
        id="patient_id"
        name="patient_id"
        value={formData.patient_id}
        onChange={handleChange}
        disabled={Boolean(initialValues.id)}
      >
        <option value="">Select a patient</option>

        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name || patient.full_name || `Patient ${patient.id}`}
          </option>
        ))}
      </select>

      {errors.patient_id && <p role="alert">{errors.patient_id}</p>}

      <label htmlFor="diagnosis">Diagnosis</label>

      <textarea
        id="diagnosis"
        name="diagnosis"
        value={formData.diagnosis}
        onChange={handleChange}
        placeholder="Enter diagnosis"
      />

      {errors.diagnosis && <p role="alert">{errors.diagnosis}</p>}

      <label htmlFor="treatment">Treatment</label>

      <textarea
        id="treatment"
        name="treatment"
        value={formData.treatment}
        onChange={handleChange}
        placeholder="Enter treatment"
      />

      {errors.treatment && <p role="alert">{errors.treatment}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Medical Record"}
      </button>
    </form>
  );
}

export default RecordForm;