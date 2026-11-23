/*
 * TODO: Compose patient account details and supported clinical views.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { get, patch } from "../../lib/api/client";

export default function PatientDetailPage() {
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [contactDetails, setContactDetails] = useState({
    phone_number: "",
    address: "",
  });

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
        if (active) {
          setPatient(data);
          setContactDetails({
            phone_number: data.phone_number || "",
            address: data.address || "",
          });
        }
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

  async function saveContactDetails(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updatedPatient = await patch(`/api/patients/${patientId}`, contactDetails);
      setPatient(updatedPatient?.patient || updatedPatient?.data || updatedPatient);
      setContactDetails({
        phone_number: updatedPatient.phone_number || "",
        address: updatedPatient.address || "",
      });
      setEditing(false);
      setMessage("Patient contact details updated.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update patient contact details.");
    } finally {
      setSaving(false);
    }
  }

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
          {!editing ? (
            <>
              <p><strong>Phone:</strong> {profile?.phone_number || "Not available"}</p>
              <p><strong>Address:</strong> {profile?.address || "Not available"}</p>
            </>
          ) : (
            <form className="record-form" onSubmit={saveContactDetails}>
              <label htmlFor="patient-phone-number">Phone number</label>
              <input
                id="patient-phone-number"
                name="phone_number"
                type="tel"
                maxLength={15}
                value={contactDetails.phone_number}
                onChange={(event) =>
                  setContactDetails((current) => ({
                    ...current,
                    phone_number: event.target.value,
                  }))
                }
              />
              <label htmlFor="patient-address">Address</label>
              <textarea
                id="patient-address"
                name="address"
                maxLength={200}
                value={contactDetails.address}
                onChange={(event) =>
                  setContactDetails((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
              />
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save contact details"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setContactDetails({
                    phone_number: patient.phone_number || "",
                    address: patient.address || "",
                  });
                  setError("");
                }}
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}
        {message && <p className="success-message" role="status">{message}</p>}
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setMessage("");
              setError("");
            }}
          >
            Edit contact details
          </button>
        )}

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
