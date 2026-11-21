/*
 * TODO: Present laboratory requests and test-result workflows.
 */
import { useEffect, useState } from "react";
import { get } from "../../lib/api/client";
import { useLaboratoryTests, useCreateLaboratoryTest, useUpdateLaboratoryTest } from "../../features/laboratory/hooks/useLaboratoryTests";
import LabTestPanel from "../../features/laboratory/components/LaboratoryTestPanel";

export default function LaboratoryPage() {
  const { tests, isLoading: loading, error, refresh } = useLaboratoryTests();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [optionsError, setOptionsError] = useState("");
  const createTestMutation = useCreateLaboratoryTest();
  const updateTestMutation = useUpdateLaboratoryTest();
  const isSubmitting = createTestMutation.isLoading || updateTestMutation.isLoading;

  useEffect(() => {
    let active = true;

    async function loadFormOptions() {
      try {
        const [patientResponse, doctorResponse] = await Promise.all([
          get("/api/patients?per_page=100"),
          get("/api/doctors"),
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
      } catch (requestError) {
        if (active) {
          setOptionsError(
            requestError.message || "Unable to load patients and doctors."
          );
        }
      }
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