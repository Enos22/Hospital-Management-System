/*
 * TODO: Present the patient landing page from data available in the API.
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../app/navigation/routePaths";
import { useAppointments } from "../../features/appointments/hooks/useAppointments";
import { useMedicalRecords } from "../../features/medical-records/hooks/useMedicalRecords";
import { usePrescriptions } from "../../features/prescriptions/hooks/usePrescriptions";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getAppointmentDateValue(appointment) {
  return appointment.appointment_date || appointment.appointmentDate;
}

export default function HomePage() {
  const {
    appointments = [],
    loading: appointmentsLoading,
    error: appointmentsError,
  } = useAppointments();

  const {
    records,
    medicalRecords,
    loading: recordsLoading,
  } = useMedicalRecords();

  const {
    prescriptions = [],
    loading: prescriptionsLoading,
  } = usePrescriptions();

  const recordList = records || medicalRecords || [];
  const loading = appointmentsLoading || recordsLoading || prescriptionsLoading;

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return appointments
      .filter((appointment) => {
        const date = new Date(getAppointmentDateValue(appointment));
        const status = String(appointment.status || "").toLowerCase();

        return (
          !Number.isNaN(date.getTime()) &&
          date >= now &&
          !["cancelled", "completed"].includes(status)
        );
      })
      .sort(
        (a, b) =>
          new Date(getAppointmentDateValue(a)) -
          new Date(getAppointmentDateValue(b))
      );
  }, [appointments]);

  return (
    <main className="patient-page">
      <section className="page-header">
        <h1>Patient Dashboard</h1>
        <p>Welcome to your AfyaCare patient portal.</p>
      </section>

      {loading && <p>Loading your dashboard...</p>}

      <section className="dashboard-stats">
        <article className="dashboard-card">
          <h3>Appointments</h3>
          <p className="dashboard-number">{appointments.length}</p>
          <Link to={ROUTES.PATIENT.APPOINTMENTS}>View appointments</Link>
        </article>

        <article className="dashboard-card">
          <h3>Medical Records</h3>
          <p className="dashboard-number">{recordList.length}</p>
          <Link to={ROUTES.PATIENT.HISTORY}>View medical history</Link>
        </article>

        <article className="dashboard-card">
          <h3>Prescriptions</h3>
          <p className="dashboard-number">{prescriptions.length}</p>
          <Link to={ROUTES.PATIENT.PRESCRIPTIONS}>View prescriptions</Link>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Upcoming Appointments</h2>
          <Link to={ROUTES.PATIENT.APPOINTMENTS}>View all</Link>
        </div>

        {appointmentsError && (
          <p className="error-message" role="alert">
            {appointmentsError}
          </p>
        )}

        {!loading && upcomingAppointments.length === 0 && (
          <p>You have no upcoming appointments.</p>
        )}

        {upcomingAppointments.slice(0, 5).map((appointment) => {
          const time =
            appointment.appointment_time ||
            appointment.start_time ||
            "Not provided";

          return (
            <article className="appointment-summary" key={appointment.id}>
              <h3>Appointment #{appointment.id}</h3>
              <p>Date: {formatDate(getAppointmentDateValue(appointment))}</p>
              <p>Time: {time}</p>
              <p>Status: {appointment.status || "Pending"}</p>
            </article>
          );
        })}
      </section>

      <section className="dashboard-section">
        <h2>Quick Actions</h2>

        <div className="quick-actions">
          <Link to={ROUTES.PATIENT.BOOK}>Book an Appointment</Link>
          <Link to={ROUTES.PATIENT.HISTORY}>View Medical History</Link>
          <Link to={ROUTES.PATIENT.LAB}>View Laboratory Results</Link>
          <Link to={ROUTES.PATIENT.BILLS}>View Bills</Link>
        </div>
      </section>
    </main>
  );
}