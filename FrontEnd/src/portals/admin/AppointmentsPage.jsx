import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../lib/api/errors';

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('access_token');
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, `Request failed (${response.status})`)
    );
  }

  return data;
}

function getAppointmentList(response) {
  const result = response?.appointments ?? response?.data ?? response;
  return Array.isArray(result) ? result : [];
}

function getAppointmentId(appointment) {
  return appointment.id ?? appointment.appointment_id;
}

function getDate(appointment) {
  return String(appointment.appointment_date ?? '').slice(0, 10);
}

function getTime(appointment) {
  return String(
    appointment.appointment_time ?? appointment.start_time ?? ''
  ).slice(0, 5);
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAppointments() {
      try {
        setLoading(true);
        setError('');

        const query = dateFilter
          ? `?${new URLSearchParams({ appointment_date: dateFilter })}`
          : '';

        const response = await apiRequest(`/api/appointments${query}`, {
          signal: controller.signal,
        });

        setAppointments(getAppointmentList(response));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load appointments.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAppointments();
    return () => controller.abort();
  }, [dateFilter, refreshKey]);

  async function handleBook(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const startTime = form.get('start_time');
    const endTime = form.get('end_time');

    if (endTime <= startTime) {
      setError('The end time must be after the start time.');
      return;
    }

    const appointment = {
      patient_id: Number(form.get('patient_id')),
      doctor_id: Number(form.get('doctor_id')),
      appointment_date: form.get('appointment_date'),
      start_time: startTime,
      end_time: endTime,
    };

    try {
      await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(appointment),
      });

      formElement.reset();
      setMessage('Appointment booked.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not book the appointment.');
    }
  }

  async function handleView(id) {
    setError('');
    setMessage('');

    try {
      const response = await apiRequest(`/api/appointments/${id}`);
      setSelectedAppointment(response?.data ?? response);
    } catch (err) {
      setError(err.message || 'Could not load that appointment.');
    }
  }

  async function handleUpdate(event, id) {
    event.preventDefault();
    setError('');
    setMessage('');

    const form = new FormData(event.currentTarget);
    const update = {
      appointment_date: form.get('appointment_date'),
      appointment_time: form.get('appointment_time'),
      status: form.get('status'),
    };

    try {
      await apiRequest(`/api/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(update),
      });

      setMessage('Appointment updated.');
      setRefreshKey((value) => value + 1);
      await handleView(id);
    } catch (err) {
      setError(err.message || 'Could not update the appointment.');
    }
  }

  async function handleCancel(id) {
    const confirmation = window.prompt(
      'Type CANCEL to confirm cancellation:'
    );

    if (confirmation !== 'CANCEL') {
      setMessage('Cancellation was not confirmed.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/appointments/${id}/cancel`, {
        method: 'PATCH',
      });

      setSelectedAppointment(null);
      setMessage('Appointment cancelled.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not cancel the appointment.');
    }
  }

  return (
    <section>
      <h1>Appointments</h1>

      <label>
        Filter by date:{' '}
        <input
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
        />
      </label>

      <button
        type="button"
        onClick={() => setRefreshKey((value) => value + 1)}
      >
        Refresh list
      </button>

      <h2>Book appointment</h2>
      <form onSubmit={handleBook}>
        <label>
          Patient profile ID (not the patient account ID)
          <input name="patient_id" type="number" min="1" required />
        </label>

        <label>
          Doctor profile ID (not the doctor account ID)
          <input name="doctor_id" type="number" min="1" required />
        </label>

        <label>
          Date
          <input name="appointment_date" type="date" required />
        </label>

        <label>
          Start time
          <input name="start_time" type="time" required />
        </label>

        <label>
          End time
          <input name="end_time" type="time" required />
        </label>

        <button type="submit">Book appointment</button>
      </form>

      {loading && <p>Loading appointments...</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {!loading && appointments.length === 0 && (
        <p>No appointments found for this date.</p>
      )}

      {appointments.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => {
              const id = getAppointmentId(appointment);

              return (
                <tr key={id ?? index}>
                  <td>{id ?? '—'}</td>
                  <td>
                    {appointment.patient_name ??
                      appointment.patient_id ??
                      '—'}
                  </td>
                  <td>
                    {appointment.doctor_name ??
                      appointment.doctor_id ??
                      '—'}
                  </td>
                  <td>{getDate(appointment) || '—'}</td>
                  <td>{getTime(appointment) || '—'}</td>
                  <td>{appointment.status ?? '—'}</td>
                  <td>
                    <button type="button" onClick={() => handleView(id)}>
                      View
                    </button>
                    <button type="button" onClick={() => handleCancel(id)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selectedAppointment && (
        <section>
          <h2>Update appointment</h2>

          <form
            onSubmit={(event) =>
              handleUpdate(event, getAppointmentId(selectedAppointment))
            }
          >
            <label>
              Date
              <input
                name="appointment_date"
                type="date"
                defaultValue={getDate(selectedAppointment)}
                required
              />
            </label>

            <label>
              Time
              <input
                name="appointment_time"
                type="time"
                defaultValue={getTime(selectedAppointment)}
                required
              />
            </label>

            <label>
              Status
              <input
                name="status"
                defaultValue={selectedAppointment.status ?? 'scheduled'}
                required
              />
            </label>

            <button type="submit">Save update</button>
            <button
              type="button"
              onClick={() => setSelectedAppointment(null)}
            >
              Close
            </button>
          </form>

          <h3>Appointment details</h3>
          <pre>{JSON.stringify(selectedAppointment, null, 2)}</pre>
        </section>
      )}
    </section>
  );
}