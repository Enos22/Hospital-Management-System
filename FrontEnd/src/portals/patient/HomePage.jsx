/*
 * TODO: Present the patient landing page from data available in the API.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../app/navigation/routePaths";
import { useAppointments } from "../../features/appointments/hooks/useAppointments";
import { useMedicalRecords } from "../../features/medical-records/hooks/useMedicalRecords";
import { usePrescriptions } from "../../features/prescriptions/hooks/usePrescriptions";
import { get, patch } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/AuthContext.jsx";
import { formatDate, formatTime } from "../../lib/format/FormatDate.js";

function getAppointmentDateValue(appointment) {
  return appointment.appointment_date || appointment.appointmentDate;
}

export default function HomePage() {
  const { user } = useAuth();
  const userId = user?.user_id ?? user?.id;
  const [contactDetails, setContactDetails] = useState({
    phone_number: "",
    address: "",
  });
  const [contactLoading, setContactLoading] = useState(true);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadContactDetails() {
      if (!userId) {
        setContactLoading(false);
        setContactError("Your patient account could not be identified.");
        return;
      }

      try {
        const patient = await get(`/api/patients/${userId}`);
        if (active) {
          setContactDetails({
            phone_number: patient.phone_number || "",
            address: patient.address || "",
          });
        }
      } catch (error) {
        if (active) {
          setContactError(error.message || "Unable to load contact details.");
        }
      } finally {
        if (active) setContactLoading(false);
      }
    }

    loadContactDetails();
    return () => {
      active = false;
    };
  }, [userId]);

  async function saveContactDetails(event) {
    event.preventDefault();
    setContactSaving(true);
    setContactError("");
    setContactMessage("");

    try {
      const patient = await patch(`/api/patients/${userId}`, contactDetails);
      setContactDetails({
        phone_number: patient.phone_number || "",
        address: patient.address || "",
      });
      setContactMessage("Contact details saved.");
    } catch (error) {
      setContactError(error.message || "Unable to save contact details.");
    } finally {
      setContactSaving(false);
    }
  }

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

      <section className="dashboard-section">
        <h2>Contact Details</h2>
        {contactLoading ? (
          <p>Loading contact details...</p>
        ) : (
          <form className="record-form" onSubmit={saveContactDetails}>
            <label htmlFor="patient-phone-number">Phone number</label>
            <input
              id="patient-phone-number"
              name="phone_number"
              type="tel"
              maxLength={15}
              value={contactDetails.phone_number}
              onChange={(event) =>
                setContactDetails((current) => ({
                  ...current,
                  phone_number: event.target.value,
                }))
              }
            />

            <label htmlFor="patient-address">Address</label>
            <textarea
              id="patient-address"
              name="address"
              maxLength={200}
              value={contactDetails.address}
              onChange={(event) =>
                setContactDetails((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
            />

            {contactError && (
              <p className="error-message" role="alert">{contactError}</p>
            )}
            {contactMessage && (
              <p className="success-message" role="status">{contactMessage}</p>
            )}

            <button type="submit" disabled={contactSaving}>
              {contactSaving ? "Saving..." : "Save contact details"}
            </button>
          </form>
        )}
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
          const rawTime =
            appointment.appointment_time || appointment.start_time;
          const time = rawTime ? formatTime(rawTime) : "Not provided";

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