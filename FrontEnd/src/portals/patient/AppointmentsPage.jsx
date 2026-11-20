/*
 * TODO: Present the patient's appointments and supported cancellation action.
 */
import { useAppointments } from "../../features/appointments/hooks/useAppointments";
import AppointmentCard from "../../features/appointments/components/AppointmentCard";

export default function AppointmentsPage() {
  const {
    appointments,
    loading,
    actionLoading,
    error,
    refresh,
    removeAppointment,
  } = useAppointments();

  const handleCancel = async (appointmentId) => {
    try {
      await removeAppointment(appointmentId);
    } catch {
      // Handled by useAppointments
    }
  };

  if (loading) {
    return <p className="loading-state">Loading your appointments...</p>;
  }

  return (
    <section className="patient-appointments-page">
      <div className="page-header">
        <div>
          <h1>My Appointments</h1>
          <p>View and manage your scheduled appointments.</p>
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
          <p className="empty-state">You do not have any appointments yet.</p>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole="patient"
              onCancel={handleCancel}
              cancelling={actionLoading}
            />
          ))
        )}
      </div>
    </section>
  );
}
