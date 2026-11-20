/*
 * TODO: Implement booking only when required profile IDs and slot data exist.
 */
import { useEffect, useState } from "react";
import { get } from "../../lib/api/client";
import { createAppointment } from "../../features/appointments/api/appointmentsApi";

const EMPTY_FORM = {
  doctor_id: "",
  appointment_date: "",
  start_time: "",
  end_time: "",
};

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookAppointmentPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookingData() {
      setLoading(true);
      setError("");

      try {
        const [userResponse, doctorsResponse] = await Promise.all([
          get("/api/auth/checksession"),
          get("/api/doctors"),
        ]);

        const user = userResponse?.data?.user || userResponse?.data || userResponse;
        const doctorData =
          doctorsResponse?.data?.doctors ||
          doctorsResponse?.data ||
          doctorsResponse;

        if (!active) return;

        setPatientId(user?.patient_id || null);
        setDoctors(Array.isArray(doctorData) ? doctorData : []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load booking information.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBookingData();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!patientId) {
      setError(
        "Your patient profile could not be found. Please contact the hospital."
      );
      return;
    }

    const { doctor_id, appointment_date, start_time, end_time } = form;

    if (!doctor_id || !appointment_date || !start_time || !end_time) {
      setError("Please complete all appointment fields.");
      return;
    }

    if (end_time <= start_time) {
      setError("The end time must be later than the start time.");
      return;
    }

    setSubmitting(true);

    try {
      await createAppointment({
        patient_id: Number(patientId),
        doctor_id: Number(doctor_id),
        appointment_date,
        start_time,
        end_time,
      });

      setSuccess("Your appointment has been booked successfully.");
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || "Unable to book your appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="patient-page">Loading booking information...</main>;
  }

  return (
    <main className="patient-page">
      <section className="page-header">
        <h1>Book an Appointment</h1>
        <p>Select a doctor and choose your preferred appointment time.</p>
      </section>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {success && <p className="success-message">{success}</p>}

      <form className="patient-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="doctor_id">Select Doctor</label>
          <select
            id="doctor_id"
            name="doctor_id"
            value={form.doctor_id}
            onChange={handleChange}
            required
          >
            <option value="">Choose a doctor</option>
            {doctors.map((doctor) => {
              const label = doctor.username || doctor.name || "Doctor";
              const specialty = doctor.speciality ? ` - ${doctor.speciality}` : "";

              return (
                <option
                  key={doctor.doctor_id || doctor.id}
                  value={doctor.doctor_id || ""}
                >
                  {label}
                  {specialty}
                </option>
              );
            })}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="appointment_date">Appointment Date</label>
          <input
            id="appointment_date"
            type="date"
            name="appointment_date"
            min={getToday()}
            value={form.appointment_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="start_time">Start Time</label>
          <input
            id="start_time"
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_time">End Time</label>
          <input
            id="end_time"
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </main>
  );
}