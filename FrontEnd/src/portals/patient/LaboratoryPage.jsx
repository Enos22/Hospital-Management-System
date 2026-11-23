/*
 * TODO: Present the patient's laboratory tests and results.
 */
import { useLaboratoryTests } from "../../features/laboratory/hooks/useLaboratoryTests";
import { formatDate } from "../../lib/format/FormatDate.js";

export default function LaboratoryPage() {
  const { tests, laboratoryTests, loading, error } = useLaboratoryTests();
  const testList = tests || laboratoryTests || [];

  return (
    <main className="patient-page">
      <section className="page-header">
        <h1>Laboratory Results</h1>
        <p>View your laboratory tests and their results.</p>
      </section>

      {loading && <p>Loading laboratory results...</p>}

      {error && (
        <p className="error-message" role="alert">
          {error.message || String(error)}
        </p>
      )}

      {!loading && testList.length === 0 && (
        <p>No laboratory tests are currently available.</p>
      )}

      <section className="laboratory-list">
        {testList.map((test) => (
          <article className="laboratory-card" key={test.id}>
            <h2>{test.test_name || "Laboratory Test"}</h2>

            <p>
              <strong>Status:</strong> {test.status || "Not available"}
            </p>

            <p>
              <strong>Result:</strong> {test.result || "Results not yet available"}
            </p>

            <p>
              <strong>Date:</strong> {formatDate(test.created_at)}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
