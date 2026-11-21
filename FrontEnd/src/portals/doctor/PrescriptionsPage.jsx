/*
 * TODO: Present prescriptions and doctor-permitted prescription actions.
 */
import { useEffect, useState } from "react";
import { get } from "../../lib/api/client";
import { getApiErrorMessage } from "../../lib/api/errors";
import usePrescriptions from "../../features/prescriptions/hooks/usePrescriptions";
import PrescriptionForm from "../../features/prescriptions/components/PrescriptionForm";
import PrescriptionCard from "../../features/prescriptions/components/PrescriptionCard";

function getPatientOptions(response) {
  const patients = response?.patients ?? response?.data?.patients ?? [];
  return patients.filter((patient) => patient.patient_id != null);
}

function getDoctorOptions(response) {
  const doctors = Array.isArray(response)
    ? response
    : response?.doctors ?? response?.data?.doctors ?? [];
  return doctors.filter((doctor) => doctor.doctor_id != null);
}

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
  const [patientCount, setPatientCount] = useState(null);
  const [doctorCount, setDoctorCount] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFormOptions() {
      setOptionsLoading(true);
      setOptionsError("");
      const [patientResult, doctorResult, medicineResult] =
        await Promise.allSettled([
            get("/api/patients?per_page=100"),
            get("/api/doctors"),
            get("/api/pharmacy/medicines?per_page=100"),
        ]);
      if (!active) return;

      const failures = [];
      if (patientResult.status === "fulfilled") {
        const patientResponse = patientResult.value;
        const patientRecords =
          patientResponse?.patients ?? patientResponse?.data?.patients ?? [];
        setPatientCount(patientRecords.length);
        setPatients(getPatientOptions(patientResponse));
      } else {
        failures.push(
          `Patients: ${getApiErrorMessage(patientResult.reason, "Unable to load patients.")}`
        );
      }

      if (doctorResult.status === "fulfilled") {
        const doctorResponse = doctorResult.value;
        const doctorRecords = Array.isArray(doctorResponse)
          ? doctorResponse
          : doctorResponse?.doctors ?? doctorResponse?.data?.doctors ?? [];
        setDoctorCount(doctorRecords.length);
        setDoctors(getDoctorOptions(doctorResponse));
      } else {
        failures.push(
          `Doctors: ${getApiErrorMessage(doctorResult.reason, "Unable to load doctors.")}`
        );
      }

      if (medicineResult.status === "fulfilled") {
        setMedicines(
          medicineResult.value?.medicines ??
            medicineResult.value?.data?.medicines ??
            []
        );
      } else {
        failures.push(
          `Medicines: ${getApiErrorMessage(medicineResult.reason, "Unable to load medicines.")}`
        );
      }
      setOptionsError(failures.join(" "));
      setOptionsLoading(false);
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
      {!optionsError && patientCount !== null && patients.length === 0 && (
        <p className="error-message" role="status">
          {patientCount > 0
            ? `${patientCount} patient accounts were returned, but none have patient profile IDs. An administrator must create or repair their patient profiles before prescriptions can be created.`
            : "No patient accounts were returned by the API."}
        </p>
      )}
      {!optionsError && doctorCount !== null && doctors.length === 0 && (
        <p className="error-message" role="status">
          {doctorCount > 0
            ? `${doctorCount} doctor accounts were returned, but none have doctor profile IDs. An administrator must create or link doctor profiles before prescriptions can be created.`
            : "No doctor accounts were returned by the API."}
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
