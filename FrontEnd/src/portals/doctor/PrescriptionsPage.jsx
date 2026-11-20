/*
 * TODO: Present prescriptions and doctor-permitted prescription actions.
 */
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

  if (loading) {
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

      <div className="prescription-form-section">
        <h2>Create Prescription</h2>
        <PrescriptionForm onSubmit={createPrescription} />
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
