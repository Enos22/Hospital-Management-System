import Button from "../../../components/ui/Button.jsx";
import { formatDate, formatTime } from "../../../lib/format/FormatDate.js";

export default function AppointmentCard({
  appointment,
  userRole,
  onCancel,
  cancelling = false,
}) {
  const date = appointment.appointment_date
    ? formatDate(String(appointment.appointment_date).slice(0, 10))
    : "Date unavailable";
  const time = formatTime(appointment.appointment_time || appointment.start_time);

  return (
    <article className="appointment-card">
      <div>
        <h3>Appointment {appointment.id}</h3>
        <p>{date} at {time}</p>
        <p>Status: {appointment.status || "scheduled"}</p>
        {userRole !== "patient" && <p>Patient: {appointment.patient_id}</p>}
      </div>
      {onCancel && String(appointment.status).toLowerCase() !== "cancelled" && (
        <Button
          variant="danger"
          size="small"
          loading={cancelling}
          onClick={() => onCancel(appointment.id ?? appointment.appointment_id)}
        >
          Cancel
        </Button>
      )}
    </article>
  );
}
