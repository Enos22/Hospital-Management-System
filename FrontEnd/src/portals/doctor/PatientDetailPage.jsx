/*
 * TODO: Compose patient account details and supported clinical views.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { get } from "../../lib/api/client";

export default function PatientDetailPage() {
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      setError("Patient ID is missing.");
      return;
    }

    let active = true;

    async function loadPatient() {
      setLoading(true);
      setError("");

      try {
        const response = await get(`/api/patients/${patientId}`);
        const data = response?.patient || response?.data || response;
        if (active) setPatient(data);
      } catch (err) {
        if (active) setError(err.message || "Unable to load patient details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPatient();
    return () => {
      active = false;
    };
  }, [patientId]);

  if (loading) {
    return <p className="loading-state">Loading patient details...</p>;
  }

  if (error) {
    return (
      <section className="patient-detail-page">
        <p className="error-message" role="alert">
          {error}
        </p>
        <Link to="/doctor/patients">Back to patients</Link>
      </section>
    );
  }

  if (!patient) {
    return <p className="empty-state">Patient not found.</p>;
  }

  const profile = patient.patient || patient;
  const profileId = patient.patient_id || profile?.id || null;
  const displayName = profile?.name || patient.username || "Patient";

  return (
    <section className="patient-detail-page">
      <div className="page-header">
        <div>
          <h1>Patient Details</h1>
          <p>View the patient's registered information.</p>
        </div>

        <Link to="/doctor/patients">Back to patients</Link>
      </div>

      <article className="patient-detail-card">
        <h2>{displayName}</h2>

        <div className="detail-group">
          <p><strong>Account ID:</strong> {patient.id}</p>
          <p><strong>Email:</strong> {profile?.email || patient.email || "Not provided"}</p>
          <p><strong>Patient profile ID:</strong> {profileId ?? "Not available from this API response"}</p>
          <p><strong>Age:</strong> {profile?.age ?? "Not available"}</p>
          <p><strong>Gender:</strong> {profile?.gender || "Not available"}</p>
          <p><strong>Phone:</strong> {profile?.phone_number || "Not available"}</p>
          <p><strong>Address:</strong> {profile?.address || "Not available"}</p>
        </div>

        {!profileId && (
          <p className="info-message">
            This endpoint currently returns the login account rather than a
            clinical patient profile ID. Use the clinical profile ID when
            creating medical records, prescriptions, or lab requests.
          </p>
        )}
      </article>
    </section>
  );
}
