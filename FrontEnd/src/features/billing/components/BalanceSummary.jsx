import { usePatientBalance } from "../hooks/useBilling";

function formatAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function BalanceSummary({ patientId }) {
  const {
    data: balance,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = usePatientBalance(patientId);

  if (patientId == null || patientId === "") {
    return (
      <section className="balance-summary" aria-label="Outstanding balance">
        <p>Patient profile ID is required to view the balance.</p>
      </section>
    );
  }

  if (isPending) {
    return (
      <section
        className="balance-summary"
        aria-label="Outstanding balance"
        aria-busy="true"
      >
        <p role="status">Loading balance…</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="balance-summary" aria-label="Outstanding balance">
        <p role="alert">
          Balance could not be loaded: {getErrorMessage(error)}
        </p>
        <button type="button" onClick={() => refetch()}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="balance-summary" aria-label="Outstanding balance">
      <h2>Outstanding balance</h2>
      <p className="balance-summary-amount">
        {formatAmount(balance?.outstanding_balance)}
      </p>
      <p>Patient ID: {balance?.patient_id ?? patientId}</p>
      {isFetching && <span role="status">Refreshing…</span>}
    </section>
  );
}
