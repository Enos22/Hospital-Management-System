import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../lib/api/errors';
import { getApiUrl } from '../../lib/api/client';

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('access_token');

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

function getDoctorList(response) {
  const result = response?.doctors ?? response?.data ?? response;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.doctors)) return result.doctors;

  return [];
}

function getDoctorId(doctor) {
  return doctor.id ?? doctor.doctor_id;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDoctors() {
      try {
        setLoading(true);
        setError('');

        const response = await apiRequest('/api/doctors', {
          signal: controller.signal,
        });

        setDoctors(getDoctorList(response));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load doctors.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDoctors();
    return () => controller.abort();
  }, [refreshKey]);

  async function handleAddDoctor(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const newDoctor = {
      username: form.get('username').trim(),
      speciality_id: Number(form.get('speciality_id')),
      password: form.get('password'),
    };

    setError('');
    setMessage('');

    try {
      await apiRequest('/api/doctors', {
        method: 'POST',
        body: JSON.stringify(newDoctor),
      });

      formElement.reset();
      setShowCreateForm(false);
      setMessage('Doctor added.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not add doctor.');
    }
  }

  async function handleViewDoctor(doctor) {
    const id = getDoctorId(doctor);

    if (!id) {
      setError('This doctor record does not include an ID for viewing.');
      return;
    }

    setError('');
    setDoctorDetails(null);

    try {
      const response = await apiRequest(`/api/doctors/${id}`);
      setDoctorDetails(response?.data ?? response);
    } catch (err) {
      setError(err.message || 'Could not load doctor details.');
    }
  }

  async function handleUpdateDoctor(event) {
    event.preventDefault();

    const id = getDoctorId(editingDoctor);
    if (!id) {
      setError('This doctor record does not include an ID for updating.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const username = form.get('username').trim();
    const email = form.get('email').trim();
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) {
      setError('Enter a username or email to update.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/doctors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      setEditingDoctor(null);
      setMessage('Doctor updated.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not update doctor.');
    }
  }

  async function handleDeleteDoctor(doctor) {
    const id = getDoctorId(doctor);

    if (!id) {
      setError('This doctor record does not include an ID for deletion.');
      return;
    }

    const confirmation = window.prompt(
      `Type DELETE to remove ${doctor.username ?? 'this doctor'}:`
    );

    if (confirmation !== 'DELETE') {
      setMessage('Deletion was not confirmed.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/doctors/${id}`, {
        method: 'DELETE',
      });

      setDoctorDetails(null);
      setEditingDoctor(null);
      setMessage('Doctor deleted.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not delete doctor.');
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const searchableText = [
      doctor.username,
      doctor.email,
      doctor.specialty,
      doctor.speciality,
      doctor.speciality_id,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(search.toLowerCase());
  });

  return (
    <section>
      <h1>Doctors</h1>

      <label>
        Search doctors:{' '}
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, email, or specialty"
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
        {showCreateForm ? 'Close form' : 'Add doctor'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleAddDoctor}>
          <h2>Add doctor</h2>

          <label>
            Username
            <input name="username" required />
          </label>

          <label>
            Specialty ID
            <input name="speciality_id" type="number" min="1" required />
          </label>

          <label>
            Password
            <input name="password" type="password" required />
          </label>

          <button type="submit">Save doctor</button>
        </form>
      )}

      {loading && <p>Loading doctors...</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {!loading && filteredDoctors.length === 0 && (
        <p>No doctors found.</p>
      )}

      {filteredDoctors.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor, index) => (
              <tr key={getDoctorId(doctor) ?? index}>
                <td>{getDoctorId(doctor) ?? '—'}</td>
                <td>{doctor.username ?? doctor.name ?? '—'}</td>
                <td>{doctor.email ?? '—'}</td>
                <td>
                  {doctor.specialty ??
                    doctor.speciality ??
                    doctor.speciality_id ??
                    '—'}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleViewDoctor(doctor)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(doctor)}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDoctor(doctor)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingDoctor && (
        <form onSubmit={handleUpdateDoctor}>
          <h2>Update doctor</h2>

          <label>
            Username
            <input
              name="username"
              defaultValue={editingDoctor.username ?? ''}
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              defaultValue={editingDoctor.email ?? ''}
            />
          </label>

          <button type="submit">Save changes</button>
          <button type="button" onClick={() => setEditingDoctor(null)}>
            Close
          </button>
        </form>
      )}

      {doctorDetails && (
        <section>
          <h2>Doctor details</h2>
          <pre>{JSON.stringify(doctorDetails, null, 2)}</pre>
          <button type="button" onClick={() => setDoctorDetails(null)}>
            Close details
          </button>
        </section>
      )}
    </section>
  );
}