import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../lib/api/errors';
import { getApiUrl, getToken } from '../../lib/api/client';

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, `Request failed (${response.status})`)
    );
  }

  return data;
}

function getPatientList(response) {
  const result = response?.patients ?? response?.data ?? response;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.patients)) return result.patients;

  return [];
}

function getPatientId(patient) {
  return patient.id ?? patient.patient_id;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPatients() {
      try {
        setLoading(true);
        setError('');

        const query = search
          ? `?${new URLSearchParams({ search })}`
          : '';

        const response = await apiRequest(`/api/patients${query}`, {
          signal: controller.signal,
        });

        setPatients(getPatientList(response));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load patients.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPatients();
    return () => controller.abort();
  }, [search, refreshKey]);

  async function handleAddPatient(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const newPatient = {
      username: form.get('username').trim(),
      email: form.get('email').trim(),
      password: form.get('password'),
    };

    setError('');
    setMessage('');

    try {
      await apiRequest('/api/patients', {
        method: 'POST',
        body: JSON.stringify(newPatient),
      });

      formElement.reset();
      setShowCreateForm(false);
      setMessage('Patient account added.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not add the patient account.');
    }
  }

  async function handleViewPatient(patient) {
    const id = getPatientId(patient);

    if (!id) {
      setError('This patient record does not include an ID for viewing.');
      return;
    }

    setError('');
    setPatientDetails(null);

    try {
      const response = await apiRequest(`/api/patients/${id}`);
      setPatientDetails(response?.data ?? response);
    } catch (err) {
      setError(err.message || 'Could not load patient details.');
    }
  }

  async function handleUpdatePatient(event) {
    event.preventDefault();

    const id = getPatientId(editingPatient);
    if (!id) {
      setError('This patient record does not include an ID for updating.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const username = form.get('username').trim();

    if (!username) {
      setError('Enter a username.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/patients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ username }),
      });

      setEditingPatient(null);
      setMessage('Patient account updated.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not update the patient account.');
    }
  }

  async function handleDeletePatient(patient) {
    const id = getPatientId(patient);

    if (!id) {
      setError('This patient record does not include an ID for deletion.');
      return;
    }

    const confirmation = window.prompt(
      `Type DELETE to remove ${patient.username ?? 'this patient account'}:`
    );

    if (confirmation !== 'DELETE') {
      setMessage('Deletion was not confirmed.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/patients/${id}`, {
        method: 'DELETE',
      });

      setPatientDetails(null);
      setEditingPatient(null);
      setMessage('Patient account deleted.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not delete the patient account.');
    }
  }

  return (
    <section>
      <h1>Patients</h1>

      <label>
        Search patients:{' '}
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search patients"
        />
      </label>

      <button
        type="button"
        onClick={() => setRefreshKey((value) => value + 1)}
        disabled={loading}
      >
        Refresh list
      </button>

      <button
        type="button"
        onClick={() => setShowCreateForm((visible) => !visible)}
      >
        {showCreateForm ? 'Close form' : 'Add patient'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleAddPatient}>
          <h2>Add patient account</h2>

          <label>
            Username
            <input name="username" required />
          </label>

          <label>
            Email
            <input name="email" type="email" required />
          </label>

          <label>
            Password
            <input name="password" type="password" required />
          </label>

          <button type="submit">Save patient</button>
        </form>
      )}

      {loading && <p>Loading patients...</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {!loading && patients.length === 0 && <p>No patients found.</p>}

      {patients.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr key={getPatientId(patient) ?? index}>
                <td>{getPatientId(patient) ?? '—'}</td>
                <td>{patient.username ?? patient.name ?? '—'}</td>
                <td>{patient.email ?? '—'}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleViewPatient(patient)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPatient(patient)}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePatient(patient)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingPatient && (
        <form onSubmit={handleUpdatePatient}>
          <h2>Update patient account</h2>

          <label>
            Username
            <input
              name="username"
              defaultValue={editingPatient.username ?? ''}
              required
            />
          </label>

          <button type="submit">Save changes</button>
          <button type="button" onClick={() => setEditingPatient(null)}>
            Close
          </button>
        </form>
      )}

      {patientDetails && (
        <section>
          <h2>Patient details</h2>
          <pre>{JSON.stringify(patientDetails, null, 2)}</pre>
          <button type="button" onClick={() => setPatientDetails(null)}>
            Close details
          </button>
        </section>
      )}
    </section>
  );
}