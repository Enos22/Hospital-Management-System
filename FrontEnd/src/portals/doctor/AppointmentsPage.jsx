/*
 * TODO: Present appointments scoped to the signed-in doctor.
 */
import { useAppointments } from "../../features/appointments/hooks/useAppointments";
import AppointmentCard from "../../features/appointments/components/AppointmentCard";

export default function AppointmentsPage() {
  const { appointments, loading, error, refresh } = useAppointments();

  if (loading) {
    return <p className="loading-state">Loading your schedule...</p>;
  }

  return (
    <section className="doctor-appointments-page">
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>View and manage your patient appointments.</p>
        </div>

        <button type="button" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <div className="appointments-list">
        {appointments.length === 0 ? (
          <p className="empty-state">
            You currently have no scheduled appointments.
          </p>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole="doctor"
            />
          ))
        )}
      </div>
    </section>
  );
}