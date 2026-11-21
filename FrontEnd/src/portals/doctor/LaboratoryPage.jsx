/*
 * TODO: Present laboratory requests and test-result workflows.
 */
import { useEffect, useState } from "react";
import { get } from "../../lib/api/client";
import { getApiErrorMessage } from "../../lib/api/errors";
import { useLaboratoryTests, useCreateLaboratoryTest, useUpdateLaboratoryTest } from "../../features/laboratory/hooks/useLaboratoryTests";
import LabTestPanel from "../../features/laboratory/components/LaboratoryTestPanel";

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

export default function LaboratoryPage() {
  const { tests, isLoading: loading, error, refresh } = useLaboratoryTests();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientCount, setPatientCount] = useState(null);
  const [doctorCount, setDoctorCount] = useState(null);
  const [optionsError, setOptionsError] = useState("");
  const createTestMutation = useCreateLaboratoryTest();
  const updateTestMutation = useUpdateLaboratoryTest();
  const isSubmitting = createTestMutation.isLoading || updateTestMutation.isLoading;

  useEffect(() => {
    let active = true;

    async function loadFormOptions() {
      const [patientResult, doctorResult] = await Promise.allSettled([
        get("/api/patients?per_page=100"),
        get("/api/doctors"),
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
      setOptionsError(failures.join(" "));
    }

    loadFormOptions();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="loading-state">Loading laboratory requests...</p>;
  }

  return (
    <section className="doctor-laboratory-page">
      <div className="page-header">
        <div>
          <h1>Laboratory</h1>
          <p>View and manage laboratory requests for your patients.</p>
        </div>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error.message || String(error)}
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
            ? `${patientCount} patient accounts were returned, but none have patient profile IDs. An administrator must create or repair their patient profiles before lab requests can be made.`
            : "No patient accounts were returned by the API."}
        </p>
      )}
      {!optionsError && doctorCount !== null && doctors.length === 0 && (
        <p className="error-message" role="status">
          {doctorCount > 0
            ? `${doctorCount} doctor accounts were returned, but none have doctor profile IDs. An administrator must create or link doctor profiles before lab requests can be made.`
            : "No doctor accounts were returned by the API."}
        </p>
      )}

      <LabTestPanel
        tests={tests}
        patients={patients}
        doctors={doctors}
        onCreate={async (payload) => {
          await createTestMutation.mutateAsync(payload);
          await refresh();
        }}
        onUpdate={async (payload) => {
          await updateTestMutation.mutateAsync(payload);
          await refresh();
        }}
        isSubmitting={isSubmitting || Boolean(optionsError)}
      />
    </section>
  );
}