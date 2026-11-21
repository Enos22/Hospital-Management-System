/*
 * TODO: Present laboratory requests and test-result workflows.
 */
import { useLaboratoryTests, useCreateLaboratoryTest, useUpdateLaboratoryTest } from "../../features/laboratory/hooks/useLaboratoryTests";
import LabTestPanel from "../../features/laboratory/components/LaboratoryTestPanel";

export default function LaboratoryPage() {
  const { tests, isLoading: loading, error, refresh } = useLaboratoryTests();
  const createTestMutation = useCreateLaboratoryTest();
  const updateTestMutation = useUpdateLaboratoryTest();
  const isSubmitting = createTestMutation.isLoading || updateTestMutation.isLoading;

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

      <LabTestPanel
        tests={tests}
        onCreate={async (payload) => {
          await createTestMutation.mutateAsync(payload);
          await refresh();
        }}
        onUpdate={async (payload) => {
          await updateTestMutation.mutateAsync(payload);
          await refresh();
        }}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}