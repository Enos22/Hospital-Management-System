/*
 * TODO: Present laboratory requests and test-result workflows.
 */
import useLaboratory from "../../features/laboratory/hooks/useLaboratory";
import LabTestPanel from "../../features/laboratory/components/LabTestPanel";

export default function LaboratoryPage() {
  const { tests, loading, error, createTest, updateTest } = useLaboratory();

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
          {error}
        </p>
      )}

      <LabTestPanel
        tests={tests}
        onCreate={createTest}
        onUpdate={updateTest}
      />
    </section>
  );
}