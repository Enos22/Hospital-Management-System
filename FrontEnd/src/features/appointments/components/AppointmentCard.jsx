/*
 * TODO: Render appointment details and supported role-specific actions.
 */
export default function AppointmentCard({
  appointment = {},
  userRole,
  onCancel,
  cancelling = false,
}) {
  const { id, date, start_time, end_time, status = "unknown", doctor, patient, reason } = appointment;

  const currentStatus = status.toLowerCase();
  const canCancel = currentStatus === "scheduled" || currentStatus === "pending";

  const formatDate = (val) => {
    if (!val) return "Date unavailable";
    return new Date(`${val}T00:00:00`).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (val) => (val ? val.slice(0, 5) : "Time unavailable");

  const displayName = userRole === "doctor" ? patient?.name || "Patient" : doctor?.name || "Doctor";

  return (
    <article className="appointment-card">
      <div className="appointment-card-header">
        <div>
          <h3>{displayName}</h3>
          <p>{formatDate(date)}</p>
        </div>
        <span className={`appointment-status ${currentStatus}`}>
          {status}
        </span>
      </div>

      <div className="appointment-card-details">
        <p>
          <strong>Time:</strong> {formatTime(start_time)} - {formatTime(end_time)}
        </p>
        {reason && (
          <p>
            <strong>Reason:</strong> {reason}
          </p>
        )}
      </div>

      {canCancel && onCancel && (
        <div className="appointment-card-actions">
          <button
            type="button"
            onClick={() => onCancel(id)}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel appointment"}
          </button>
        </div>
      )}
    </article>
  );
}