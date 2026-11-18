/*
 * TODO: Present the admin appointment list and supported appointment actions.
 */
import { useState } from "react";
import useAppointments from "../../features/appointments/hooks/useAppointments";
import AppointmentCard from "../../features/appointments/components/AppointmentCard";

export default function AppointmentsPage() {
  const { appointments, loading, actionLoading, error, removeAppointment, refresh } = useAppointments();
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    setCancellingId(id);
    try {
      await removeAppointment(id);
    } catch {
      // Error is already captured by the useAppointments hook state
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <p className="loading-state">Loading appointments...</p>;
  }

  return (
    <section className="doctor-appointments-page">
      <div className="page-header">
        <div>
          <h1>My Appointments</h1>
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

      {appointments.length === 0 ? (
        <p className="empty-state">No appointments found.</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole="doctor"
              onCancel={handleCancel}
              cancelling={actionLoading && cancellingId === appointment.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}