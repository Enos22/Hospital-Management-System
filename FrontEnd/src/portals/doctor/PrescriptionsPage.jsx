/*
 * TODO: Present prescriptions and doctor-permitted prescription actions.
 */
import { useEffect, useState } from "react";
import { get } from "../../lib/api/client";
import usePrescriptions from "../../features/prescriptions/hooks/usePrescriptions";
import PrescriptionForm from "../../features/prescriptions/components/PrescriptionForm";
import PrescriptionCard from "../../features/prescriptions/components/PrescriptionCard";

export default function PrescriptionsPage() {
  const {
    prescriptions,
    loading,
    error,
    createPrescription,
    updatePrescription,
  } = usePrescriptions();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFormOptions() {
      setOptionsLoading(true);
      setOptionsError("");
      try {
        const [patientResponse, doctorResponse, medicineResponse] =
          await Promise.all([
            get("/api/patients?per_page=100"),
            get("/api/doctors"),
            get("/api/pharmacy/medicines?per_page=100"),
          ]);
        if (!active) return;
        setPatients(
          (patientResponse?.patients ?? []).filter(
            (patient) => patient.patient_id != null
          )
        );
        setDoctors(
          (Array.isArray(doctorResponse) ? doctorResponse : []).filter(
            (doctor) => doctor.doctor_id != null
          )
        );
        setMedicines(medicineResponse?.medicines ?? []);
      } catch (requestError) {
        if (active) {
          setOptionsError(
            requestError.message || "Unable to load prescription form options."
          );
        }
      } finally {
        if (active) setOptionsLoading(false);
      }
    }

    loadFormOptions();
    return () => {
      active = false;
    };
  }, []);

  if (loading || optionsLoading) {
    return <p className="loading-state">Loading prescriptions...</p>;
  }

  return (
    <section className="doctor-prescriptions-page">
      <div className="page-header">
        <div>
          <h1>Prescriptions</h1>
          <p>View and manage prescriptions for your patients.</p>
        </div>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {optionsError && (
        <p className="error-message" role="alert">
          {optionsError}
        </p>
      )}

      <div className="prescription-form-section">
        <h2>Create Prescription</h2>
        <PrescriptionForm
          patients={patients}
          doctors={doctors}
          medicines={medicines}
          onSubmit={createPrescription}
          isSubmitting={Boolean(optionsError)}
        />
      </div>

      <div className="prescriptions-list">
        <h2>Existing Prescriptions</h2>

        {prescriptions.length === 0 ? (
          <p className="empty-state">No prescriptions found.</p>
        ) : (
          prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              onEdit={updatePrescription}
            />
          ))
        )}
      </div>
    </section>
  );
}
