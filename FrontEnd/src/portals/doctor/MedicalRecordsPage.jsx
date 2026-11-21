/*
 * TODO: Present medical records and doctor-permitted record actions.
 */
import { useCallback, useEffect, useState } from "react";
import { get, post, patch } from "../../lib/api/client";

const EMPTY_FORM = {
  patient_id: "",
  diagnosis: "",
  treatment: "",
};

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await get("/api/medical-records?page=1&per_page=50");
      const list = response?.medical_records || response?.data;

      if (!Array.isArray(list)) {
        throw new Error("Invalid medical records response.");
      }

      setRecords(list);
    } catch (err) {
      setError(err.message || "Unable to load medical records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      patient_id: Number(form.patient_id),
      diagnosis: form.diagnosis.trim(),
      treatment: form.treatment.trim(),
    };

    try {
      if (!payload.patient_id || !payload.diagnosis || !payload.treatment) {
        throw new Error("Patient ID, diagnosis, and treatment are required.");
      }

      if (editingId) {
        await patch(`/api/medical-records/${editingId}`, {
          diagnosis: payload.diagnosis,
          treatment: payload.treatment,
        });
        setMessage("Medical record updated successfully.");
      } else {
        await post("/api/medical-records", payload);
        setMessage("Medical record created successfully.");
      }

      resetForm();
      await loadRecords();
    } catch (err) {
      setError(err.message || "Unable to save medical record.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (record) => {
    setEditingId(record.id);
    setForm({
      patient_id: record.patient_id ?? "",
      diagnosis: record.diagnosis || "",
      treatment: record.treatment || "",
    });
    setError("");
    setMessage("");
  };

  if (loading) {
    return <p className="loading-state">Loading medical records...</p>;
  }

  return (
    <section className="doctor-medical-records-page">
      <div className="page-header">
        <div>
          <h1>Medical Records</h1>
          <p>Review and manage patient medical records.</p>
        </div>
        <button type="button" onClick={loadRecords}>
          Refresh
        </button>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <form className="record-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Update Medical Record" : "Create Medical Record"}</h2>

        <label htmlFor="patient_id">Patient profile ID</label>
        <input
          id="patient_id"
          name="patient_id"
          type="number"
          min="1"
          value={form.patient_id}
          onChange={handleChange}
          disabled={Boolean(editingId)}
          required
        />

        <label htmlFor="diagnosis">Diagnosis</label>
        <textarea
          id="diagnosis"
          name="diagnosis"
          value={form.diagnosis}
          onChange={handleChange}
          required
        />

        <label htmlFor="treatment">Treatment</label>
        <textarea
          id="treatment"
          name="treatment"
          value={form.treatment}
          onChange={handleChange}
          required
        />

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update record" : "Create record"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel editing
            </button>
          )}
        </div>
      </form>

      <div className="medical-records-list">
        <h2>Existing Records</h2>

        {records.length === 0 ? (
          <p className="empty-state">No medical records found.</p>
        ) : (
          records.map((record) => (
            <article className="medical-record-card" key={record.id}>
              <h3>{record.diagnosis || "Diagnosis unavailable"}</h3>
              <p><strong>Record ID:</strong> {record.id}</p>
              <p><strong>Patient profile ID:</strong> {record.patient_id}</p>
              <p><strong>Treatment:</strong> {record.treatment || "Not provided"}</p>
              <p><strong>Date:</strong> {record.record_date || "Not available"}</p>

              <button type="button" onClick={() => startEditing(record)}>
                Edit record
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}